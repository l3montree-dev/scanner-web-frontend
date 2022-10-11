import ecsFormat from "@elastic/ecs-pino-format";
import pino from "pino";
import { config } from "../config";

const logger = pino({
  ...(config.isProduction && ecsFormat()),
  level: process.env.LOG_LEVEL || "debug",
});
export const getLogger = (file: string) => {
  if (config.isProduction) {
    return logger.child({ file });
  }
  return logger;
};
