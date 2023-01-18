import { PrismaClient, User } from "@prisma/client";
import { config } from "../config";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import {
  DomainWithScanResult,
  IScanErrorResponse,
  PaginateRequest,
  PaginateResult,
} from "../types";
import { neverThrow } from "../utils/common";
import { DTO, toDTO } from "../utils/server";

const handleNewDomain = async (
  domain: { fqdn: string; group?: string },
  prisma: PrismaClient,
  connectToUser?: User
): Promise<{ fqdn: string }> => {
  // fetch the last existing report and check if we only need to update that one.
  let payload = {
    fqdn: domain.fqdn,
    lastScan: null,
    group: domain.group ?? "unknown",
  };

  await neverThrow(
    prisma.domain.create({
      data: payload,
    })
  );
  if (connectToUser) {
    await neverThrow(
      prisma.userDomainRelation.create({
        data: {
          userId: connectToUser.id,
          fqdn: payload.fqdn,
        },
      })
    );
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
      errorCount: 1,
      fqdn: content.fqdn,
      group: "unknown",
      lastScan: content.timestamp ?? Date.now(),
    },
  });

  return res;
};

const translateSortDirection = (
  direction?: string | "1" | "-1"
): "ASC" | "DESC" => {
  if (direction === "-1") {
    return "DESC";
  }
  return "ASC";
};

const translateSort = (sort?: string): `sr.${InspectionType}` | "d.fqdn" => {
  if (!sort) {
    return "d.fqdn";
  }

  if (Object.keys(InspectionTypeEnum).includes(sort)) {
    return `sr.${sort as InspectionType}`;
  }

  return "d.fqdn";
};

const getDomainsOfNetworksWithLatestTestResult = async (
  user: User,
  paginateRequest: PaginateRequest & { search?: string } & {
    sort?: string;
    sortDirection?: string;
  },
  prisma: PrismaClient
): Promise<PaginateResult<DTO<DomainWithScanResult>>> => {
  const sqlValues = [
    user.id,
    paginateRequest.pageSize,
    paginateRequest.page * paginateRequest.pageSize,
  ];
  if (paginateRequest.search !== undefined && paginateRequest.search !== "") {
    sqlValues.unshift(paginateRequest.search);
  }

  const selectInspectionTypes = Object.keys(InspectionTypeEnum)
    .map((key) => `sr.${key} as ${key}`)
    .join(", ");

  const [total, domains] = await Promise.all([
    prisma.domain.count({
      where: {
        users: {
          some: {
            userId: user.id,
          },
        },
        ...(paginateRequest.search !== undefined &&
        paginateRequest.search !== ""
          ? {
              fqdn: {
                search: sqlValues[0] as string,
              },
            }
          : {}),
      },
    }),

    // subject to sql injection!!!
    prisma.$queryRawUnsafe(
      `
    SELECT ${selectInspectionTypes}, d.fqdn as fqdn, d.createdAt as createdAt, d.updatedAt as updatedAt, d.group as 'group', d.queued as queued, d.errorCount as errorCount, d.lastScan as lastScan from user_domain_relations udr
    INNER JOIN domains d on udr.fqdn = d.fqdn 
    LEFT JOIN scan_reports sr on d.fqdn = sr.fqdn  
    WHERE NOT EXISTS(
        SELECT 1 from scan_reports sr2 where sr.fqdn = sr2.fqdn AND sr.createdAt > sr2.createdAt
      ) 
      ${
        paginateRequest.search !== undefined && paginateRequest.search !== ""
          ? "AND MATCH (d.fqdn) AGAINST (?)"
          : ""
      }
      AND userId = ?
      ORDER BY ${translateSort(paginateRequest.sort)} ${translateSortDirection(
        paginateRequest.sortDirection
      )}
      LIMIT ?
      OFFSET ?;
`,
      ...sqlValues
    ) as Promise<any[]>,
  ]);

  const data = domains.map((d) =>
    toDTO({
      lastScan: d.lastScan,
      fqdn: d.fqdn,
      group: d.group,
      queued: d.queued,
      errorCount: d.errorCount,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      scanReport: {
        ...(Object.fromEntries(
          Object.keys(InspectionTypeEnum).map((key) => [
            key,
            d[key] === null ? null : Boolean(d[key]),
          ])
        ) as { [key in InspectionType]: boolean | null }),
      },
    })
  );

  return {
    total,
    page: paginateRequest.page,
    pageSize: paginateRequest.pageSize,
    data,
  };
};

const getDomains2Scan = async (prisma: PrismaClient) => {
  // get all domains which have not been scanned in the last 24 hours
  const domains = await prisma.domain.findMany({
    where: {
      AND: [
        // it has not been scanned in the past scan interval days.
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
        // it either belongs to a group which is configured to be scanned or it is monitored by a user
        {
          OR: [
            {
              group: {
                in: config.generateStatsForGroups,
              },
            },
            {
              users: {
                some: {},
              },
            },
          ],
        },
        {
          queued: false,
          // it is scan-able
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

  await prisma.domain.updateMany({
    where: {
      fqdn: {
        in: domains.map((d) => d.fqdn),
      },
    },
    data: {
      queued: true,
    },
  });

  return domains;
};

export const domainService = {
  handleNewDomain,
  handleDomainScanError,
  getDomainsOfNetworksWithLatestTestResult,
  getDomains2Scan,
};
