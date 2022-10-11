import { config } from "../config";
import { httpClientFactory } from "./httpClient";

export const clientHttpClient = httpClientFactory(
  config.clientTimeout,
  config.clientRetries
);
