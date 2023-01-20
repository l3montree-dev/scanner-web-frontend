import { randomUUID } from "crypto";
import { Server as HttpServer } from "http";
import PQueue from "p-queue";
import { Server } from "socket.io";
import { config } from "../config";
import { prisma } from "../db/connection";

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
import { eachDay } from "../utils/time";
import { domainService } from "./domainService";

import { getLogger } from "./logger";
import { rabbitMQClient, rabbitMQRPCClient } from "./rabbitmqClient";
import { reportService } from "./reportService";
import { statService } from "./statService";

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
  logger.info("connected to database - starting lookup response loop");
  rabbitMQClient.subscribe(
    "ip-lookup-response",
    async (msg) => {
      const content = JSON.parse(msg.content.toString()).data as {
        fqdn: string;
      };
      try {
        await domainService.handleNewDomain(content, prisma);
      } catch (e: any) {
        // always ack the message - catch the error.
        logger.error({ err: e.message });
      }
    },
    { durable: true, maxPriority: 10 }
  );
});

const startScanResponseLoop = once(() => {
  logger.info("starting scan response loop");
  rabbitMQClient.subscribe("scan-response", async (msg) => {
    const content = JSON.parse(msg.content.toString()).data as IScanResponse;

    let address = content.ipAddress;
    if (!address) {
      logger.error({ target: content.target }, "no ip found");
      // we cannot do anything...
      return;
    }
    if (isScanError(content)) {
      try {
        await domainService.handleDomainScanError(content, prisma);
      } finally {
        logger.error({ target: content.target }, content.result.error);
        return;
      }
    }

    try {
      await reportService.handleNewScanReport(content, prisma);
    } catch (e) {
      // always ack the message - catch the error.
      logger.error(e);
    }
  });
});

const statLoop = once(() => {
  let running = false;
  const promiseQueue = new PQueue({
    concurrency: 2,
  });
  logger.info("starting stat loop");
  setInterval(async () => {
    if (isMaster() && !running) {
      running = true;
      // check which stats need to be generated.
      config.generateStatsForGroups.forEach((group) => {
        eachDay(config.statFirstDay, new Date()).forEach((date) => {
          // check if the stat does exist.
          promiseQueue.add(async () => {
            const exists = await prisma.stat.findFirst({
              where: {
                subject: group,
                time: date,
              },
            });
            if (!exists) {
              // generate the stat.
              const stat = await statService.getGroupFailedSuccessPercentage(
                group,
                prisma,
                date
              );

              const start = Date.now();
              await prisma.stat.create({
                data: {
                  subject: group,
                  time: date,
                  value: stat,
                },
              });
              logger.info(
                { duration: Date.now() - start },
                `generated stat for ${group} on ${new Date(date)}`
              );
            }
          });
        });
      });

      // generate the stats for each user.
      const users = await prisma.user.findMany();
      users.forEach((user) => {
        eachDay(config.statFirstDay, new Date()).forEach((date) => {
          // check if the stat does exist.
          promiseQueue.add(async () => {
            const exists = await prisma.stat.findFirst({
              where: {
                subject: user.id,
                time: date,
              },
            });
            if (!exists) {
              // generate the stat.
              const stat = await statService.getUserFailedSuccessPercentage(
                user,
                prisma,
                date
              );

              const start = Date.now();
              await prisma.stat.create({
                data: {
                  subject: user.id,
                  time: date,
                  value: stat,
                },
              });
              logger.info(
                { duration: Date.now() - start },
                `generated stat for ${user.id} on ${new Date(date)}`
              );
            }
          });
        });
      });

      await promiseQueue.onIdle();
      running = false;
    }
  }, 10 * 1000);
});

const startScanLoop = once(() => {
  let running = false;
  const promiseQueue = new PQueue({
    concurrency: 5,
    timeout: 5 * 1000,
  });

  setInterval(async () => {
    try {
      if (running || !isMaster()) {
        logger.warn("scan loop is already running or not master");
        return;
      }
      running = true;
      const domains = await domainService.getDomains2Scan(prisma);

      if (domains.length === 0) {
        running = false;
        logger.debug({ component: "SCAN_LOOP" }, "no domains to scan");
        return;
      }
      const requestId = randomUUID();
      logger.debug(
        { requestId, component: "SCAN_LOOP" },
        `found ${domains.length} domains to scan - sending scan request with id: ${requestId}`
      );
      promiseQueue.addAll(
        domains.map((domain) => {
          return async () => {
            inspect(requestId, domain.fqdn);
          };
        })
      );

      running = false;
    } catch (e) {
      running = false;
      logger.error(e);
    }
  }, +(process.env.SCAN_INTERVAL ?? 10 * 1000));
});

export const serverCtrl = {
  startSocketIOServer,
  startLookupResponseLoop,
  startScanResponseLoop,
  startScanLoop,
  statLoop,
};
