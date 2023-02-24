import { PrismaClient } from "@prisma/client";
import { databaseConnection } from "../server-config";

import { GlobalRef } from "../services/globalRef";

declare global {
  interface BigInt {
    toJSON(): string;
  }
  interface Decimal {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

const prismaRef = new GlobalRef<PrismaClient>("prisma");
if (!prismaRef.value) {
  prismaRef.value = new PrismaClient({
    datasources: {
      db: {
        url: `postgres://${databaseConnection.user}:${databaseConnection.password}@${databaseConnection.host}:${databaseConnection.port}/${databaseConnection.database}`,
      },
    },
  });
}

export const prisma = prismaRef.value;
