import { Prisma, PrismaClient, User } from "@prisma/client";
import PQueue from "p-queue";
import { config } from "../config";
import { InspectionType } from "../inspection/scans";
import { IDashboard, ChartData } from "../types";
import { toDTO } from "../utils/server";
import { eachDay } from "../utils/time";
import { getLogger } from "./logger";

const logger = getLogger(__filename);

const getTotalsOfUser = async (user: User, prisma: PrismaClient) => {
  // count the domains this user has access to
  return {
    uniqueTargets: await prisma.targetCollectionRelation.count({
      where: {
        collectionId: user.defaultCollectionId,
      },
    }),
  };
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
            subject: collectionId.toString(),
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
            subject: collectionId.toString(),
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
  tagId: number,
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
        COUNT(*) as "totalCount" from reports inner join targets ON reports.uri = targets.uri inner join target_collections tcr ON targets.uri = tcr.uri where trc."collectionId" = ${tagId}`
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
): Promise<{
  [referenceName: string]: Array<ChartData & { date: number }>;
}> => {
  const stats = await prisma.stat.findMany({
    where: {
      subject: {
        in: config.generateStatsForGroups,
      },
      time: {
        gte: config.statFirstDay.getTime(),
      },
    },
    orderBy: {
      time: "asc",
    },
  });
  const res: {
    [referenceName: string]: Array<ChartData & { date: number }>;
  } = {};
  stats.sort((a, b) => Number(a.time) - Number(b.time));
  stats.forEach((s) => {
    const { subject, time, value } = s;
    if (!res[subject]) {
      res[subject] = [];
    }
    res[subject].push({
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
  user: User,
  prisma: PrismaClient
): Promise<IDashboard> => {
  const [totals, stats] = await Promise.all([
    getTotalsOfUser(user, prisma),
    prisma.stat.findMany({
      where: {
        subject: user.id,
        time: {
          gte: config.statFirstDay.getTime(),
        },
      },
      orderBy: {
        time: "asc",
      },
    }),
  ]);

  const values = toDTO(
    stats.map((s) => ({
      ...(s.value as {
        data: { [key in InspectionType]: number };
        totalCount: number;
      }),
      date: s.time,
    }))
  );

  return {
    totals,
    currentState: values[stats.length - 1] || {
      data: {},
    },
    historicalData: values || [],
  };
};

export const statService = {
  getTotals,
  getTotalsOfUser,
  getDashboardForUser,
  getReferenceChartData,
  generateStatsForCollection,
};
