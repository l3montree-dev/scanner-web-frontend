import { config } from "../config";
import { httpClientFactory } from "./httpClient";
import { getLogger } from "./logger";

const logger = getLogger(__filename);
export const serverHttpClient = httpClientFactory(
  logger,
  config.serverTimeout,
  config.serverRetries
);
