import { Prisma, PrismaClient, User } from "@prisma/client";
import PQueue from "p-queue";
import { config } from "../config";
import { InspectionType } from "../inspection/scans";
import { ChartData, CollectionStatMap, Guest, IDashboard } from "../types";
import { collectionId, isGuestUser } from "../utils/common";
import { toDTO } from "../utils/server";
import { eachDay } from "../utils/time";
import { getLogger } from "./logger";

const logger = getLogger(__filename);

const getTotalsOfUser = async (user: User | Guest, prisma: PrismaClient) => {
  // count the domains this user has access to
  return {
    uniqueTargets: await prisma.targetCollectionRelation.count({
      where: {
        collectionId: collectionId(user),
      },
    }),
  };
};

const deleteStatsOfCollection = async (
  collectionId: number,
  prisma: PrismaClient
) => {
  await prisma.stat.deleteMany({
    where: {
      collectionId: collectionId,
    },
  });
};

const generateStatsForCollection = async (
  collectionId: number,
  promiseQueue: PQueue,
  prisma: PrismaClient
) => {
  eachDay(config.statFirstDay, new Date()).forEach((date) => {
    // check if the stat does exist.
    promiseQueue.add(async () => {
      let exists = false;
      exists = Boolean(
        await prisma.stat.findFirst({
          where: {
            collectionId: collectionId,
            time: date,
          },
        })
      );

      if (!exists) {
        // generate the stat.
        const start = Date.now();
        const stat = await getCollectionFailedSuccessPercentage(
          collectionId,
          prisma,
          date
        );
        await prisma.stat.create({
          data: {
            collectionId: collectionId,
            time: date,
            value: stat,
          },
        });
        logger.info(
          { duration: Date.now() - start },
          `generated stat for Collection: ${collectionId} on ${new Date(date)}`
        );
      }
    });
  });
  return promiseQueue.onIdle();
};

const getTotals = async (
  prisma: PrismaClient
): Promise<{ uniqueTargets: number }> => {
  return {
    uniqueTargets: await prisma.target.count(),
  };
};

const getCollectionFailedSuccessPercentage = async (
  collectionId: number,
  prisma: PrismaClient,
  until: number
) => {
  let [res] = (await prisma.$queryRaw(
    // this query will pick the latest scan report for each domain and calculate the average of all the inspection types. If there was no scan report done before "until", it will pick the closest one of the future - this fakes the stats but was requested by the customer
    Prisma.sql`
    WITH older AS (
        SELECT DISTINCT ON (uri)
        *
        FROM scan_reports
        WHERE "createdAt" <= to_timestamp(${until / 1000})
        ORDER BY uri,"createdAt" DESC
    )
    ,
    younger AS (
        SELECT DISTINCT ON (uri)
        *
        FROM scan_reports
        WHERE "createdAt" > to_timestamp(${until / 1000})
        AND NOT EXISTS(SELECT 1 from older where older.uri = scan_reports.uri)
        ORDER BY uri,"createdAt" ASC
    ),
    reports AS (
    SELECT * FROM older /* older */
    UNION
    SELECT * FROM younger /* younger */
    ) SELECT AVG("subResourceIntegrity"::int) as "subResourceIntegrity",
        AVG("noMixedContent"::int) as "noMixedContent",
        AVG("responsibleDisclosure"::int) as "responsibleDisclosure",
        AVG("dnsSec"::int) as "dnsSec",
        AVG("caa"::int) as "caa",
        AVG("ipv6"::int) as "ipv6",
        AVG("rpki"::int) as "rpki",
        AVG("http"::int) as "http",
        AVG("https"::int) as "https",
        AVG("http308"::int) as "http308",
        AVG("httpRedirectsToHttps"::int) as "httpRedirectsToHttps",
        AVG("hsts"::int) as "hsts",
        AVG("hstsPreloaded"::int) as "hstsPreloaded",
        AVG("contentSecurityPolicy"::int) as "contentSecurityPolicy",
        AVG("xFrameOptions"::int) as "xFrameOptions",
        AVG("xssProtection"::int) as "xssProtection",
        AVG("contentTypeOptions"::int) as "contentTypeOptions",
        AVG("secureSessionCookies"::int) as "secureSessionCookies",
        AVG("tlsv1_2"::int) as "tlsv1_2",
        AVG("tlsv1_3"::int) as "tlsv1_3",
        AVG("deprecatedTLSDeactivated"::int) as "deprecatedTLSDeactivated",
        AVG("strongKeyExchange"::int) as "strongKeyExchange",
        AVG("strongCipherSuites"::int) as "strongCipherSuites",
        AVG("validCertificate"::int) as "validCertificate",
        AVG("strongPrivateKey"::int) as "strongPrivateKey",
        AVG("strongSignatureAlgorithm"::int) as "strongSignatureAlgorithm",
        AVG("matchesHostname"::int) as "matchesHostname",
        AVG("notRevoked"::int) as "notRevoked",
        AVG("certificateTransparency"::int) as "certificateTransparency",
        AVG("validCertificateChain"::int) as "validCertificateChain",
        COUNT(*) as "totalCount" from reports inner join targets ON reports.uri = targets.uri inner join target_collections tc ON targets.uri = tc.uri where tc."collectionId" = ${collectionId}`
  )) as any;

  res = toDTO(res);

  const { totalCount, ...data } = res;
  return {
    totalCount,
    data,
  };
};

export const getReferenceChartData = async (
  prisma: PrismaClient
): Promise<CollectionStatMap> => {
  const stats = await prisma.stat.findMany({
    where: {
      collectionId: {
        in: config.generateStatsForCollections,
      },
      time: {
        gte: config.statFirstDay.getTime(),
      },
    },
    include: {
      collection: true,
    },
    orderBy: {
      time: "asc",
    },
  });
  const res: {
    [collectionId: number]: {
      title: string;
      color: string;
      series: Array<ChartData & { date: number }>;
    };
  } = {};
  stats.sort((a, b) => Number(a.time) - Number(b.time));
  stats.forEach((s) => {
    const { collectionId, time, value } = s;
    if (!res[collectionId]) {
      res[s.collectionId] = {
        title: s.collection.title,
        color: s.collection.color,
        series: [],
      };
    }
    res[collectionId].series.push({
      date: Number(time),
      ...(value as {
        data: { [key in InspectionType]: number };
        totalCount: number;
      }),
    });
  });
  return res;
};

export const getDashboardForUser = async (
  user: User | Guest,
  prisma: PrismaClient
): Promise<IDashboard> => {
  const [totals, stats] = await Promise.all([
    getTotalsOfUser(user, prisma),
    prisma.stat.findMany({
      where: {
        collection: {
          OR: isGuestUser(user)
            ? [
                {
                  id: user.collectionId,
                },
                {
                  id: {
                    in: config.generateStatsForCollections,
                  },
                },
              ]
            : [
                { owner: { id: user.id } },
                {
                  id: {
                    in: config.generateStatsForCollections,
                  },
                },
                {
                  id: user.defaultCollectionId,
                },
              ],
        },

        time: {
          gte: config.statFirstDay.getTime(),
        },
      },
      orderBy: {
        time: "asc",
      },
      include: {
        collection: true,
      },
    }),
  ]);

  // group the stats by collection.
  const groupedStats = stats.reduce((acc, curr) => {
    if (!acc[curr.collectionId]) {
      acc[curr.collectionId] = {
        title: curr.collection.title,
        color: curr.collection.color,
        series: [],
      };
    }
    acc[curr.collectionId]!.series.push({
      date: Number(curr.time),
      ...(curr.value as {
        data: { [key in InspectionType]: number };
        totalCount: number;
      }),
    });
    return acc;
  }, {} as CollectionStatMap);

  return {
    totals,
    historicalData: groupedStats,
  };
};

export const statService = {
  getTotals,
  getTotalsOfUser,
  getDashboardForUser,
  getReferenceChartData,
  generateStatsForCollection,
  deleteStatsOfCollection,
};
