import ecsFormat from "@elastic/ecs-pino-format";
import pino from "pino";

const logger = pino({
  ...ecsFormat(),
  level: process.env.LOG_LEVEL || "debug",
});
export const getLogger = (file: string) => {
  return logger.child({
    file,
  });
};
