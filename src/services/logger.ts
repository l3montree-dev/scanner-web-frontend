import ecsFormat from "@elastic/ecs-pino-format";
import pino from "pino";
import { env } from "../environment";

const logger = pino({
  ...(env.isProduction && ecsFormat()),
  level: process.env.LOG_LEVEL || "debug",
});
export const getLogger = (file: string) => {
  if (env.isProduction) {
    return logger.child({ file });
  }
  return logger;
};
