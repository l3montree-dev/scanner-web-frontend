import { GlobalRef } from "../services/globalRef";
import { rabbitMQRPCClient } from "../services/rabbitmqClient";
import { prisma } from "../db/connection";
import { HashedScanService } from "./hashedScanService";
import { ScanService } from "./scanService";
import { featureFlags } from "../feature-flags";

export const scanService = new GlobalRef("scanService", () => {
  if (featureFlags.disableDashboard) {
    return new HashedScanService(rabbitMQRPCClient, prisma);
  } else return new ScanService(rabbitMQRPCClient, prisma);
}).value;
