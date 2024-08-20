import { GlobalRef } from "../services/globalRef";
import { rabbitMQRPCClient } from "../services/rabbitmqClient";
import { prisma } from "../db/connection";
import { HashedScanService } from "./hashedScanService";
import { ScanService } from "./scanService";

export const scanService = new GlobalRef("scanService", () => {
  if (process.env.NEXT_PUBLIC_DISABLE_DASHBOARD) {
    return new HashedScanService(rabbitMQRPCClient, prisma);
  } else return new ScanService(rabbitMQRPCClient, prisma);
}).value;
