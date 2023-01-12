import { PrismaClient } from "@prisma/client";
import { prisma } from "../db/connection";

export const withDB = async (): Promise<PrismaClient> => {
  return prisma;
};
