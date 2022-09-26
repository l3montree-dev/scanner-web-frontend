import pino from "pino";
import ecsFormat from "@elastic/ecs-pino-format";

export const logger = pino({
  ...ecsFormat(),
  level: process.env.LOG_LEVEL || "debug",
});
