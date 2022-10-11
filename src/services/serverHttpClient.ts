import { config } from "../config";
import { httpClientFactory } from "./httpClient";

export const serverHttpClient = httpClientFactory(
  config.serverTimeout,
  config.serverRetries
);
