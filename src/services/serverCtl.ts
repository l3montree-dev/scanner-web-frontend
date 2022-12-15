import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import getConnection from "../db/connection";
import { once } from "../decorators/once";
import {
  IIpLookupProgressUpdateMsg,
  IIpLookupReportMsg,
  IReport,
} from "../types";
import { isProgressMessage, transformIpLookupMsg2DTO } from "../utils/common";
import { GlobalRef } from "./globalRef";
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

export const startScanResponseLoop = once(() => {
  getConnection()
    .then((connection) => {
      logger.info("connected to database - starting scan response loop");
      rabbitMQClient.subscribe("scan-response", async (msg) => {
        const content = JSON.parse(msg.content.toString()).data as
          | {
              result: IReport["result"];
              fqdn: string;
              icon: string;
              ipAddress: string;
              duration: number;
            }
          | { fqdn: string; error: any };

        if ("error" in content) {
          logger.error({ fqdn: content.fqdn }, content.error);
          return;
        }

        const now = Date.now();
        try {
          await handleNewScanReport(
            {
              ...content,
              validFrom: now,
              lastScan: now,
              iconBase64: content.icon,
              automated: true,
              version: 1,
            },
            connection.models.Report
          );
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
