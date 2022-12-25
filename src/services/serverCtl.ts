import { randomUUID } from "crypto";
import { Server as HttpServer } from "http";
import ip from "ip";
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
import { getDomains2Scan, handleNewDomain } from "./domainService";
import { getLogger } from "./logger";
import { rabbitMQClient, rabbitMQRPCClient } from "./rabbitmqClient";
import { handleNewScanReport } from "./reportService";

const logger = getLogger(__filename);

export const startSocketIOServer = once((server: HttpServer) => {
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

export const startLookupResponseLoop = once(() => {
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
            await handleNewDomain(content, connection.models.Domain);
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

export const startScanResponseLoop = once(() => {
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
            await connection.models.Domain.updateOne(
              {
                fqdn: content.fqdn,
                ipV4AddressNumber,
              },
              {
                lastScan: content.timestamp,
                queued: false,
                // increment the error count property by 1
                $inc: { errorCount: 1 },
              }
            );
          } finally {
            logger.error({ fqdn: content.fqdn }, content.result.error);
            return;
          }
        }

        try {
          await Promise.all([
            handleNewScanReport(
              {
                ...content,
                ipAddress: address,
                validFrom: content.timestamp,
                lastScan: content.timestamp,
                iconBase64: content.icon,
                automated: true,
                version: 1,
                ipV4AddressNumber,
              },
              connection.models.Report
            ),
            connection.models.Domain.updateOne(
              {
                fqdn: content.fqdn,
                ipV4AddressNumber,
              },
              {
                lastScan: content.timestamp,
                queued: false,
              }
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

export const startScanLoop = once(() => {
  let running = false;
  getConnection()
    .then((connection) => {
      setInterval(async () => {
        try {
          if (running || !isMaster()) {
            logger.warn("scan loop is already running or not master");
            return;
          }
          running = true;
          const domains = await getDomains2Scan(connection.models.Domain);

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
          await Promise.all(
            domains.map((domain) => {
              inspect(requestId, domain.fqdn);
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
