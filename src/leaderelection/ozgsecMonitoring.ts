// read the file and parse it
import { readFile } from "fs/promises";
import getConnection from "../db/connection";
import { inspect } from "../inspection/inspect";
import { getLogger } from "../services/logger";
import { isMaster } from "./leaderelection";

interface MonitoringItem {
  fqdn: string;
  interval: number;
}

// avoid back pressure by storing running monitoring requests inside this object.
const running: { [fqdn: string]: boolean } = {};

const logger = getLogger(__filename);

const monitoringFn = async (fqdn: string) => {
  // only if this pod is the master
  if (!isMaster() || running[fqdn]) {
    return;
  }
  running[fqdn] = true;
  const now = Date.now();
  const [{ icon, results }, connection] = await Promise.all([
    inspect("cron", fqdn),
    getConnection(),
  ]);

  const report = new connection.models.Report({
    fqdn,
    duration: Date.now() - now,
    iconHref: icon,
    result: results,
    version: 1,
  });
  await report.save();
  logger.info({ duration: Date.now() - now }, `scanned site: ${fqdn}`);
  running[fqdn] = false;
};

export const startMonitoring = async () => {
  const file = await readFile("ozgsec.json", "utf8");
  const data: MonitoringItem[] = JSON.parse(file);
  logger.info(`Monitoring ${data.length} items`);

  data.forEach(({ fqdn, interval }) => {
    // start monitoring
    setInterval(
      async () => {
        try {
          await monitoringFn(fqdn);
        } catch (e) {
          logger.error(e, "error while monitoring");
        }
      },
      interval
        ? interval * 1000
        : // defaults to 4 hours.
          1000 * 60 * 60 * 4
    );
  });
};
