import { PrismaClient } from "@prisma/client";

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
        url: `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`,
      },
    },
  });
}

export const prisma = prismaRef.value;
