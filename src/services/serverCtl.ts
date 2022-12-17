import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import getConnection from "../db/connection";
import { once } from "../decorators/once";
import {
  IIpLookupProgressUpdateMsg,
  IIpLookupReportMsg,
  IReport,
  IScanResponse,
} from "../types";
import {
  isProgressMessage,
  isScanError,
  transformIpLookupMsg2DTO,
} from "../utils/common";
import { getLogger } from "./logger";
import { rabbitMQClient, rabbitMQRPCClient } from "./rabbitmqClient";
import { handleNewScanReport } from "./reportService";
import ip from "ip";
import { handleNewDomain } from "./domainService";
import { inspect } from "../inspection/inspect";

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
            const res = await handleNewDomain(
              content,
              connection.models.Domain
            );
            // request a scan of the new domain
            // in the future, the scanner could listen on the response queue as well.
            await inspect("auto", res.fqdn);
          } catch (e) {
            // always ack the message - catch the error.
            logger.error(e);
          }
        },
        { durable: true }
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
                // increment the error count property by 1
                $inc: { errorCount: 1 },
              }
            );
          } finally {
            logger.error({ fqdn: content.fqdn }, content.result.error);
            return;
          }
        }

        const now = Date.now();
        try {
          await Promise.all([
            handleNewScanReport(
              {
                ...content,
                ipAddress: address,
                validFrom: now,
                lastScan: now,
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
