import ecsFormat from "@elastic/ecs-pino-format";
import pino from "pino";

export const getLogger = (file: string) => {
  return pino({
    ...ecsFormat(),
    level: process.env.LOG_LEVEL || "debug",
  }).child({
    file,
  });
};
