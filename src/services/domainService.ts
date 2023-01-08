import { PrismaClient, ScanReport, User } from "@prisma/client";
import { Domain } from "domain";
import { IScanErrorResponse, PaginateRequest, PaginateResult } from "../types";
// only create a new report if the didPass property changed.
const handleNewDomain = async (
  domain: { fqdn: string; group?: string },
  prisma: PrismaClient
): Promise<{ fqdn: string }> => {
  // fetch the last existing report and check if we only need to update that one.
  let payload = {
    fqdn: domain.fqdn,
    lastScan: null,
    group: domain.group ?? "unknown",
  };
  try {
    await prisma.domain.create({
      data: payload,
    });
  } catch (e) {
    // probably unique key index error
  }
  return payload;
};

const handleDomainScanError = async (
  content: IScanErrorResponse,
  prisma: PrismaClient
) => {
  const res = await prisma.domain.upsert({
    where: {
      fqdn: content.fqdn,
    },
    update: {
      lastScan: content.timestamp ?? Date.now(),
      queued: false,
      errorCount: {
        increment: 1,
      },
    },
    create: {
      errorCount: 0,
      fqdn: content.fqdn,
      group: "unknown",
      lastScan: content.timestamp ?? Date.now(),
    },
  });

  return res;
};

const getDomainsOfNetworksWithLatestTestResult = async (
  user: User,
  paginateRequest: PaginateRequest & { search?: string } & {
    sort?: string;
    sortDirection?: string;
  },
  prisma: PrismaClient
): Promise<PaginateResult<Domain & { scanReport?: ScanReport }>> => {
  // get all domains of the network
  const [total, domains] = await Promise.all([
    prisma.userDomainRelation.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.userDomainRelation.findMany({
      skip: paginateRequest.pageSize * paginateRequest.page,
      take: paginateRequest.pageSize,
      where: {
        userId: user.id,
      },
      include: {
        domain: {
          include: {
            scanReport: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    }),
  ]);

  return {
    total,
    page: paginateRequest.page,
    pageSize: paginateRequest.pageSize,
    data: domains as any,
  };
};

const getDomains2Scan = async (prisma: PrismaClient) => {
  // get all domains which have not been scanned in the last 24 hours
  const domains = await prisma.domain.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              lastScan: {
                equals: null,
              },
            },
            {
              lastScan: {
                lt: new Date(
                  new Date().getTime() -
                    +(process.env.SCAN_INTERVAL_DAYS ?? 7) * 24 * 60 * 60 * 1000
                ).getTime(),
              },
            },
          ],
        },
        {
          queued: false,
          errorCount: {
            lt: 5,
          },
        },
      ],
    },
    orderBy: {
      lastScan: "asc",
    },
    take: 1_000,
  });
  return domains;
};

export const domainService = {
  handleNewDomain,
  handleDomainScanError,
  getDomainsOfNetworksWithLatestTestResult,
  getDomains2Scan,
};
