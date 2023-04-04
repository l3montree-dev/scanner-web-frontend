import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { config } from "../config";
import { getLogger } from "./logger";

const { url, token, org, bucket } = config.influx;
const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket);

const trackSecret = (secret: string) => {
  const point = new Point("secret").tag("value", secret);
  writeApi.writePoint(point);
};

const trackApiCall = (uri: string, secretOrUserId?: string) => {
  const point = new Point("apiCall")
    .tag("secretOrUserId", secretOrUserId ?? "")
    .stringField("uri", uri);

  writeApi.writePoint(point);
};
export const monitoringService = {
  trackSecret,
  trackApiCall,
};
