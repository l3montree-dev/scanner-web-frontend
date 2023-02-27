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
    uniqueTargets: await prisma.userTargetRelation.count({
      where: {
        userId: user.id,
      },
    }),
  };
};

const generateStatsForUser = async (
  user: User,
  prisma: PrismaClient,
  force = false
) => {
  const promiseQueue = new PQueue({ concurrency: 10 });
  eachDay(config.statFirstDay, new Date()).forEach((date) => {
    // check if the stat does exist.
    promiseQueue.add(async () => {
      let exists = false;
      if (!force) {
        exists = Boolean(
          await prisma.stat.findFirst({
            where: {
              subject: user.id,
              time: date,
            },
          })
        );
      } else {
        // delete the stat
        await prisma.stat.deleteMany({
          where: {
            subject: user.id,
            time: date,
          },
        });
      }

      if (!exists) {
        // generate the stat.
        const stat = await getUserFailedSuccessPercentage(user, prisma, date);

        const start = Date.now();
        await prisma.stat.create({
          data: {
            subject: user.id,
            time: date,
            value: stat,
          },
        });
        logger.info(
          { duration: Date.now() - start },
          `generated stat for ${user.id} on ${new Date(date)}`
        );
      }
    });
  });
};

const getTotals = async (
  prisma: PrismaClient
): Promise<{ uniqueTargets: number }> => {
  return {
    uniqueTargets: await prisma.target.count(),
  };
};

const getGroupFailedSuccessPercentage = async (
  group: string,
  prisma: PrismaClient,
  until: number
) => {
  let [res] = (await prisma.$queryRaw(
    // this query will pick the latest scan report for each domain and calculate the average of all the inspection types. If there was no scan report done before "until", it will pick the closest one of the future - this fakes the stats but was requested by the customer
    Prisma.sql`
SELECT AVG("subResourceIntegrity"::int) as "subResourceIntegrity",
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

    COUNT(*) as "totalCount"
from targets d INNER JOIN scan_reports sr1 on d.uri = sr1.uri
WHERE d.group = ${group} AND ((
        NOT EXISTS(
                SELECT 1 from scan_reports sr2 where sr1.uri = sr2.uri AND sr2."createdAt" < ${new Date(
                  until
                )}
                AND sr1."createdAt" < sr2."createdAt"
        ) AND sr1."createdAt" < ${new Date(until)}
    )
    OR (
        NOT EXISTS(select 1 from scan_reports sr2 where sr1.uri = sr2.uri AND sr2."createdAt" < ${new Date(
          until
        )})
        AND NOT EXISTS(select 1 from scan_reports sr2 where sr1.uri = sr2.uri AND sr1."createdAt" > sr2."createdAt")
    ))`
  )) as any;

  res = toDTO(res);

  const { totalCount, ...data } = res;
  return {
    totalCount,
    data,
  };
};

const getUserFailedSuccessPercentage = async (
  user: User,
  prisma: PrismaClient,
  until: number
): Promise<{
  totalCount: number;
  data: {
    [key in InspectionType]: number;
  };
}> => {
  let [res] = (await prisma.$queryRaw(
    // this query will pick the latest scan report for each domain and calculate the average of all the inspection types. If there was no scan report done before "until", it will pick the closest one of the future - this fakes the stats but was requested by the customer
    Prisma.sql`
SELECT AVG("subResourceIntegrity"::int) as "subResourceIntegrity",
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
 
    COUNT(*) as "totalCount"
from user_target_relations udr INNER JOIN scan_reports sr1 on udr.uri = sr1.uri
WHERE  udr."userId" = ${user.id}  AND ((
    NOT EXISTS(
        SELECT 1 from scan_reports sr2 where sr1.uri = sr2.uri AND sr2."createdAt" < ${new Date(
          until
        )} 
        AND sr1."createdAt" < sr2."createdAt"
    ) 
    AND sr1."createdAt" < ${new Date(until)}
)
OR (
    NOT EXISTS(select 1 from scan_reports sr2 where sr1.uri = sr2.uri AND sr2."createdAt" < ${new Date(
      until
    )})
    AND NOT EXISTS(select 1 from scan_reports sr2 where sr1.uri = sr2.uri AND sr1."createdAt" > sr2."createdAt")
))
`
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
  getGroupFailedSuccessPercentage,
  getDashboardForUser,
  getReferenceChartData,
  generateStatsForUser,
};
