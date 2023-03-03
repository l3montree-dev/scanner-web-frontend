import { randomUUID } from "crypto";
import PQueue from "p-queue";
import { config } from "../config";
import { prisma } from "../db/connection";

import { once } from "../decorators/once";
import { inspect } from "../inspection/inspect";
import { isMaster } from "../leaderelection/leaderelection";
import { IScanResponse } from "../types";
import { isScanError } from "../utils/common";
import { targetService } from "./targetService";

import { getLogger } from "./logger";
import { rabbitMQClient } from "./rabbitmqClient";
import { reportService } from "./reportService";
import { statService } from "./statService";

const logger = getLogger(__filename);

const startLookupResponseLoop = once(() => {
  logger.info("connected to database - starting lookup response loop");
  rabbitMQClient.subscribe(
    "ip-lookup-response",
    async (msg) => {
      const content = JSON.parse(msg.content.toString()).data as {
        fqdn: string;
      };
      try {
        await targetService.handleNewTarget({ uri: content.fqdn }, prisma);
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

    if (isScanError(content)) {
      try {
        await targetService.handleTargetScanError(content, prisma);
      } finally {
        logger.error({ target: content.target }, content.result.error.message);
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
    concurrency: 10,
  });
  logger.info("starting stat loop");
  setInterval(async () => {
    if (isMaster() && !running) {
      running = true;

      // generate the stats for each user.
      const users = await prisma.user.findMany();
      users.forEach((user) => {
        statService.generateStatsForUser(user, promiseQueue, prisma);
      });

      // check which stats need to be generated.
      config.generateStatsForGroups.forEach((group) => {
        statService.generateStatsForGroups(group, promiseQueue, prisma);
      });

      await promiseQueue.onIdle();

      running = false;
    } else {
      logger.warn("stat loop is already running");
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
      const targets = await targetService.getTargets2Scan(prisma);

      if (targets.length === 0) {
        running = false;
        logger.debug({ component: "SCAN_LOOP" }, "no targets to scan");
        return;
      }
      const requestId = randomUUID();
      logger.debug(
        { requestId, component: "SCAN_LOOP" },
        `found ${targets.length} targets to scan - sending scan request with id: ${requestId}`
      );
      promiseQueue.addAll(
        targets.map((domain) => {
          return async () => {
            inspect(requestId, domain.uri);
          };
        })
      );

      running = false;
    } catch (e) {
      running = false;
      logger.error(e);
    }
  }, +(process.env.SCAN_INTERVAL ?? 5 * 60 * 1000));
});

export const serverCtrl = {
  startLookupResponseLoop,
  startScanResponseLoop,
  startScanLoop,
  statLoop,
};
