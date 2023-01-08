import { PrismaClient } from "@prisma/client";
import { GlobalRef } from "../services/globalRef";

const prismaRef = new GlobalRef<PrismaClient>("prisma");
if (!prismaRef.value) {
  prismaRef.value = new PrismaClient();
}

export const prisma = prismaRef.value;
