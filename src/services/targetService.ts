import { PrismaClient, Target, User } from "@prisma/client";
import { toASCII } from "punycode";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import {
  DetailedTarget,
  Guest,
  IScanErrorResponse,
  PaginateRequest,
  PaginateResult,
  TargetType,
} from "../types";
import { collectionId, getHostnameFromUri } from "../utils/common";
import { DTO, toDTO } from "../utils/server";
import { targetCollectionService } from "./targetCollectionService";

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
    await targetCollectionService.createConnection(
      [payload.uri],
      connectToUser.defaultCollectionId,
      prisma
    );
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

const inspectionFilter = (filter: {
  [key in InspectionType]?: "0" | "1" | "-1";
}): string => {
  const obj = Object.entries(filter).filter(([key]) =>
    Object.values(InspectionTypeEnum).includes(key as InspectionType)
  );

  if (obj.length === 0) {
    return "";
  }
  return `${obj
    .map(([key, value]) => {
      if (value === "1") {
        return `"${key}" = true`;
      } else if (value === "-1") {
        return `"${key}" = false`;
      } else if (value === "0") {
        return `"${key}" IS NULL`;
      } else {
        return "";
      }
    })
    .filter((s) => s !== "")
    .join(" AND ")}  AND`;
};
const getUserTargetsWithLatestTestResult = async (
  user: User | Guest,
  paginateRequest: PaginateRequest & { search?: string } & {
    sortDirection?: string;
    type?: TargetType;
    collectionIds?: Array<number>;
  } & {
    [key in InspectionType]?: "0" | "1" | "-1";
  },
  prisma: PrismaClient
): Promise<PaginateResult<DTO<DetailedTarget>>> => {
  const sqlValues: Array<string | number> = [
    collectionId(user),
    paginateRequest.pageSize,
    paginateRequest.page * paginateRequest.pageSize,
  ];

  if (paginateRequest.search !== undefined && paginateRequest.search !== "") {
    sqlValues.push(toASCII(paginateRequest.search));
  }

  // subject to sql injection!!!
  const targets = (await prisma.$queryRawUnsafe(
    `
      SELECT count(*) OVER() AS "totalCount", t.*, lsd.details as details from targets t 
      LEFT JOIN scan_reports sr on t.uri = sr.uri
      LEFT JOIN last_scan_details lsd on t.uri = lsd.uri
      WHERE ${inspectionFilter(paginateRequest)} NOT EXISTS(
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
        ORDER BY t.uri ${translateSortDirection(paginateRequest.sortDirection)}
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
              lastScan: null,
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
          collections: {
            some: {},
          },
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

  return targets;
};

export const targetService = {
  handleNewTarget,
  handleTargetScanError,
  getUserTargetsWithLatestTestResult,
  getTargets2Scan,
};
