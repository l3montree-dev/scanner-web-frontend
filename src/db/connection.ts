import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

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
  prismaRef.value = new PrismaClient();
}

export const prisma = prismaRef.value;
