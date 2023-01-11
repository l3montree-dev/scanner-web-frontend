import { PrismaClient, User } from "@prisma/client";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";

const keys = Object.keys(InspectionTypeEnum);

const getTotalsOfUser = async (user: User, prisma: PrismaClient) => {
  // count the domains this user has access to
  return {
    uniqueDomains: await prisma.userDomainRelation.count({
      where: {
        userId: user.id,
      },
    }),
  };
};

const getTotals = async (
  prisma: PrismaClient
): Promise<{ uniqueDomains: number }> => {
  return {
    uniqueDomains: await prisma.domain.count(),
  };
};

const getCurrentStatePercentage = async (
  user: User,
  prisma: PrismaClient
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  console.log(
    await prisma.userDomainRelation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        domain: true,
      },
    })
  );
  return {
    totalCount: 0,
    data: keys.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}) as any,
  };
};
const getFailedSuccessPercentage = async (
  user: User,
  prisma: PrismaClient,
  timeQuery: {
    end: number;
  }
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  return {
    totalCount: 0,
    data: keys.reduce((acc, cur) => ({ ...acc, [cur]: 0 }), {}) as any,
  };
};

export const statService = {
  getTotals,
  getTotalsOfUser,
  getCurrentStatePercentage,
  getFailedSuccessPercentage,
};
