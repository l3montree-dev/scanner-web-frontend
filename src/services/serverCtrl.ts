import { randomUUID } from "crypto";
import { resolve4 } from "dns/promises";
import { Server as HttpServer } from "http";
import ip from "ip";
import PQueue from "p-queue";
import { Server } from "socket.io";

import getConnection from "../db/connection";
import { once } from "../decorators/once";
import { inspect } from "../inspection/inspect";
import { isMaster } from "../leaderelection/leaderelection";
import {
  IIpLookupProgressUpdateMsg,
  IIpLookupReportMsg,
  IScanResponse,
} from "../types";
import {
  isProgressMessage,
  isScanError,
  transformIpLookupMsg2DTO,
} from "../utils/common";
import { domainService } from "./domainService";

import { getLogger } from "./logger";
import { rabbitMQClient, rabbitMQRPCClient } from "./rabbitmqClient";
import { reportService } from "./reportService";

const logger = getLogger(__filename);

const startSocketIOServer = once((server: HttpServer) => {
  // build the server
  const io = new Server(server);
  logger.info("socket.io server started");
  io.on("connection", (socket) => {
    socket.on("ip-lookup", (msg) => {
      const { cidr, requestId } = msg;
      if (!cidr || !requestId) {
        socket.emit("ip-lookup", {
          error: "CIDR and requestId is required",
          requestId,
          cidr,
        });
        return;
      }
      logger.info({ requestId, cidr }, `received request for ${cidr}`);
      rabbitMQRPCClient.stream(
        "ip-lookup",
        {
          cidr,
          sendProgress: true,
        },
        {
          messageId: requestId,
        },
        (cancelFn, msg: IIpLookupProgressUpdateMsg | IIpLookupReportMsg) => {
          // order the result list by IP address
          const results = transformIpLookupMsg2DTO(msg);
          results.results.sort((a, b) => a.domain.localeCompare(b.domain));

          logger.info(
            { requestId, cidr },
            `sending progress update for ${cidr}, queued: ${
              "queued" in msg ? msg.queued : 0
            }, ${"processed" in msg ? msg.processed : 0} processed"}`
          );
          socket.emit("ip-lookup", { ...results, requestId, cidr });
          if (!isProgressMessage(msg)) {
            // the last message was received - stop the stream
            cancelFn();
          }
        }
      );
    });
  });
});

const startLookupResponseLoop = once(() => {
  getConnection()
    .then((connection) => {
      logger.info("connected to database - starting lookup response loop");
      rabbitMQClient.subscribe(
        "ip-lookup-response",
        async (msg) => {
          const content = JSON.parse(msg.content.toString()).data as {
            fqdn: string;
            ipV4Address: string;
          };
          try {
            await domainService.handleNewDomain(
              content,
              connection.models.Domain
            );
          } catch (e: any) {
            // always ack the message - catch the error.
            logger.error({ err: e.message });
          }
        },
        { durable: true, maxPriority: 10 }
      );
    })
    .catch((err) => {
      logger.error(err);
    });
});

const startScanResponseLoop = once(() => {
  getConnection()
    .then((connection) => {
      logger.info("connected to database - starting scan response loop");
      rabbitMQClient.subscribe("scan-response", async (msg) => {
        const content = JSON.parse(msg.content.toString())
          .data as IScanResponse;

        let address = content.ipAddress;
        if (!address) {
          logger.error({ fqdn: content.fqdn }, "no ip found");
          // we cannot do anything...
          return;
        }
        const ipV4AddressNumber = ip.toLong(address);
        if (isScanError(content)) {
          try {
            await domainService.handleDomainScanError(
              content,
              connection.models.Domain
            );
          } finally {
            logger.error({ fqdn: content.fqdn }, content.result.error);
            return;
          }
        }

        try {
          await Promise.all([
            reportService.handleNewScanReport(
              {
                ...content,
                validFrom: content.timestamp,
                lastScan: content.timestamp,
                automated: true,
                version: 1,
                ipV4AddressNumber,
              },
              connection.models
            ),
          ]);
        } catch (e) {
          // always ack the message - catch the error.
          logger.error(e);
        }
      });
    })
    .catch((err) => {
      logger.error(err);
    });
});

const startScanLoop = once(() => {
  let running = false;
  const promiseQueue = new PQueue({
    concurrency: 5,
    timeout: 5 * 1000,
  });
  getConnection()
    .then((connection) => {
      setInterval(async () => {
        try {
          if (running || !isMaster()) {
            logger.warn("scan loop is already running or not master");
            return;
          }
          running = true;
          const domains = await domainService.getDomains2Scan(
            connection.models.Domain
          );

          if (domains.length === 0) {
            running = false;
            logger.info({ component: "SCAN_LOOP" }, "no domains to scan");
            return;
          }
          const requestId = randomUUID();
          logger.info(
            { requestId, component: "SCAN_LOOP" },
            `found ${domains.length} domains to scan - sending scan request with id: ${requestId}`
          );
          promiseQueue.addAll(
            domains.map((domain) => {
              return async () => {
                inspect(requestId, domain.fqdn, domain.ipV4Address);
                const addresses = await resolve4(domain.fqdn);
                return await Promise.all(
                  addresses.map((addr) =>
                    domainService.handleNewFQDN(
                      domain.fqdn,
                      addr,
                      connection.models.Domain
                    )
                  )
                );
              };
            })
          );

          running = false;
        } catch (e) {
          running = false;
          logger.error(e);
        }
      }, +(process.env.SCAN_INTERVAL ?? 10 * 1000));
    })
    .catch((err) => {
      logger.error(err);
    });
});

export const serverCtrl = {
  startSocketIOServer,
  startLookupResponseLoop,
  startScanResponseLoop,
  startScanLoop,
};
