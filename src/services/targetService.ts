import { PrismaClient, Target, User } from "@prisma/client";
import { config } from "../config";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import {
  DetailedTarget,
  IScanErrorResponse,
  PaginateRequest,
  PaginateResult,
  TargetType,
} from "../types";
import { getHostnameFromUri } from "../utils/common";
import { DTO, shuffle, toDTO } from "../utils/server";

const handleNewTarget = async (
  target: { uri: string; group?: string; queued?: boolean },
  prisma: PrismaClient,
  connectToUser?: User
): Promise<Target> => {
  // fetch the last existing report and check if we only need to update that one.
  let payload = {
    uri: target.uri,
    lastScan: null,
    group: target.group ?? "unknown",
    queued: target.queued ?? false,
    hostname: getHostnameFromUri(target.uri),
  };

  const d = await prisma.target.upsert({
    where: {
      uri: payload.uri,
    },
    update: {},
    create: payload,
  });

  if (connectToUser) {
    await prisma.targetCollectionRelation.create({
      data: {
        collectionId: connectToUser.defaultCollectionId,
        uri: payload.uri,
      },
    });
  }

  return d;
};

const handleTargetScanError = async (
  content: IScanErrorResponse,
  prisma: PrismaClient
) => {
  const res = await prisma.target.upsert({
    where: {
      uri: content.target,
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
      uri: content.target,
      group: "unknown",
      lastScan: content.timestamp ?? Date.now(),
      hostname: getHostnameFromUri(content.target),
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

const translateSort = (sort?: string): `sr."${InspectionType}"` | "t.uri" => {
  if (!sort) {
    return "t.uri";
  }

  if (Object.values(InspectionTypeEnum).includes(sort as InspectionType)) {
    return `sr."${sort as InspectionType}"`;
  }

  return "t.uri";
};

const getUserTargetsWithLatestTestResult = async (
  user: User,
  paginateRequest: PaginateRequest & { search?: string } & {
    sort?: string;
    sortDirection?: string;
    type?: TargetType;
    collectionIds?: Array<number>;
  },
  prisma: PrismaClient
): Promise<PaginateResult<DTO<DetailedTarget>>> => {
  const sqlValues: Array<string | number> = [
    user.defaultCollectionId,
    paginateRequest.pageSize,
    paginateRequest.page * paginateRequest.pageSize,
  ];

  if (paginateRequest.search !== undefined && paginateRequest.search !== "") {
    sqlValues.push(paginateRequest.search);
  }

  // subject to sql injection!!!
  const targets = (await prisma.$queryRawUnsafe(
    `
      SELECT count(*) OVER() AS "totalCount", t.*, lsd.details as details from targets t 
      LEFT JOIN scan_reports sr on t.uri = sr.uri
      LEFT JOIN last_scan_details lsd on t.uri = lsd.uri
      WHERE NOT EXISTS(
          SELECT 1 from scan_reports sr2 where sr.uri = sr2.uri AND sr."createdAt" < sr2."createdAt"
        )
        ${
          paginateRequest.search !== undefined && paginateRequest.search !== ""
            ? "AND t.uri LIKE CONCAT('%', $4, '%')"
            : ""
        }
        AND EXISTS(
            SELECT 1 from target_collections tc where tc.uri = t.uri AND tc."collectionId" = $1
        )
        ${
          paginateRequest.collectionIds !== undefined &&
          paginateRequest.collectionIds.length > 0
            ? `AND EXISTS(
                SELECT 1 from target_collections tc where tc.uri = t.uri AND tc."collectionId" IN (${paginateRequest.collectionIds
                  .filter((id) => !isNaN(id))
                  .join(",")})
            )`
            : ""
        }
        ${
          paginateRequest.type === TargetType.unreachable
            ? 'AND "errorCount" >= 5'
            : paginateRequest.type === TargetType.reachable
            ? 'AND "errorCount" < 5'
            : ""
        }
        ORDER BY ${translateSort(
          paginateRequest.sort
        )} ${translateSortDirection(paginateRequest.sortDirection)}
        LIMIT $2
        OFFSET $3;
`,
    ...sqlValues
  )) as Array<any>;

  return {
    total: targets.length > 0 ? Number(targets[0].totalCount) : 0,
    page: paginateRequest.page,
    pageSize: paginateRequest.pageSize,
    data: targets.map(toDTO),
  };
};

const getTargets2Scan = async (prisma: PrismaClient) => {
  // get all domains which have not been scanned in the last 24 hours
  const targets = await prisma.target.findMany({
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
              collections: {
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
    take: 10_000,
  });

  await prisma.target.updateMany({
    where: {
      uri: {
        in: targets.map((d) => d.uri),
      },
    },
    data: {
      queued: true,
    },
  });

  return shuffle(targets);
};

export const targetService = {
  handleNewTarget,
  handleTargetScanError,
  getUserTargetsWithLatestTestResult,
  getTargets2Scan,
};
