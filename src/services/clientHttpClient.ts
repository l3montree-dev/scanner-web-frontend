import { config } from "../config";
import { httpClientFactory } from "./httpClient";

export const clientHttpClient = httpClientFactory(
  console,
  config.clientTimeout,
  config.clientRetries
);
