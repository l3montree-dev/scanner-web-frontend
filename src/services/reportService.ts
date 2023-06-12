import {
  LastScanDetails,
  Prisma,
  PrismaClient,
  ScanReport,
} from "@prisma/client";
import { config } from "../config";
import { InspectionType, InspectionTypeEnum } from "../scanner/scans";
import {
  DetailedTarget,
  Diffs,
  IScanSuccessResponse,
  PaginateRequest,
} from "../types";
import {
  getHostnameFromUri,
  isScanSuccess,
  limitStringValues,
} from "../utils/common";
import { DTO, toDTO } from "../utils/server";
import { scanService } from "../scanner/scanService";
import { getLogger } from "./logger";

const logger = getLogger(__filename);

const didPassEq = (
  didPassA: boolean | null | undefined,
  didPassB: boolean | null | undefined
) => {
  if (didPassA === didPassB) {
    return true;
  }
  if (
    (didPassA === null && didPassB === undefined) ||
    (didPassA === undefined && didPassB === null)
  ) {
    return true;
  }
  return false;
};
const reportDidChange = (
  lastReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">,
  newReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">
) => {
  const res = Object.values(InspectionTypeEnum).some((key) => {
    return !didPassEq(lastReport[key], newReport[key]);
  });

  return res;
};

export const diffReport = (
  lastReport: ScanReport,
  secondLastReport?: ScanReport
): Record<InspectionType, { was: boolean | null; now: boolean | null }> => {
  const res = Object.values(InspectionTypeEnum).reduce((acc, key) => {
    if (!secondLastReport) {
      acc[key] = {
        now: lastReport[key],
        was: null,
      };
      return acc;
    }
    if (lastReport[key] === secondLastReport[key]) {
      return acc;
    }
    acc[key] = {
      now: lastReport[key],
      was: secondLastReport[key],
    };
    return acc;
  }, {} as Record<InspectionType, { was: boolean | null; now: boolean | null }>);
  return res;
};

// get the changed inspections of a user between start and end.
export const getChangedInspectionsOfCollections = async (
  options: PaginateRequest & {
    start: Date;
    end: Date;
    collectionIds: number[];
  },
  prisma: PrismaClient
): Promise<Diffs> => {
  const start = options.start;
  start.setDate(start.getDate() - 1);
  // get the latest 10 scan reports of the user - using the collectionId
  const reports = (await prisma.$queryRaw(
    Prisma.sql`
    WITH last_report AS (
        SELECT DISTINCT ON (sr.uri) * FROM scan_reports sr WHERE "createdAt" >= ${start} AND "createdAt" <= ${
      options.end
    } AND EXISTS(select 1 from target_collections tc 
            WHERE sr.uri = tc.uri AND tc."collectionId" IN (${Prisma.join(
              options.collectionIds
            )})
        ) ORDER BY sr.uri, "createdAt" DESC
    ),
    not_in_interval AS (
        SELECT DISTINCT ON (nii.uri)
        *
        FROM scan_reports nii
        WHERE nii."createdAt" <= ${start}
     AND exists(SELECT 1 from last_report where last_report.uri = nii.uri)
        ORDER BY nii.uri,nii."createdAt" DESC
    ),
    in_interval AS (
        SELECT DISTINCT ON (scan_reports.uri)
        scan_reports.*
        FROM scan_reports
        WHERE exists(SELECT 1 from last_report where last_report.uri = scan_reports.uri) AND NOT EXISTS(
            SELECT 1 from not_in_interval nii where nii.uri = scan_reports.uri
            )
        ORDER BY scan_reports.uri, scan_reports."createdAt" ASC
    ),
    second_last_report AS (
        SELECT * from not_in_interval
        UNION
        SELECT * from in_interval
    )
    SELECT row_to_json(sr1.*) as "lastReport", row_to_json(sr2.*) as "secondLastReport" from last_report sr1
    INNER JOIN second_last_report sr2 ON sr1.uri = sr2.uri
    AND (
        sr2.hsts is distinct from  sr1.hsts OR
        sr2."responsibleDisclosure" is distinct from  sr1."responsibleDisclosure" OR
        sr2."tlsv1_3" is distinct from sr1."tlsv1_3" OR
        sr2."deprecatedTLSDeactivated" is distinct from  sr1."deprecatedTLSDeactivated" OR
        sr2."dnsSec" is distinct from sr1."dnsSec" OR
        sr2."rpki" is distinct from  sr1."rpki"
    )
    `
  )) as Array<{
    lastReport: ScanReport;
    secondLastReport: ScanReport;
  }>;

  return {
    start: options.start.getTime(),
    end: options.end.getTime(),
    uriDiffs: reports.map((report) => {
      return {
        uri: report.lastReport.uri,
        diff: diffReport(report.lastReport, report.secondLastReport),
      };
    }),
  };
};

export const scanResult2TargetDetails = (
  scanResponse: IScanSuccessResponse
): Record<string, any> & { sut: string } => {
  return {
    ...limitStringValues(scanResponse.result),
    // save the subject under test inside the details
    sut: scanResponse.sut ?? scanResponse.target,
  };
};

const combineReport = (
  lastReport: ScanReport | undefined,
  newReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">
) => {
  if (lastReport === undefined) {
    return newReport;
  }
  Object.values(InspectionTypeEnum).forEach((key) => {
    if (newReport[key] === null || newReport[key] === undefined) {
      newReport[key] = lastReport[key];
    }
  });
  return newReport;
};

const combineResults = (
  lastReport: ScanReport | undefined,
  lastResults: LastScanDetails | undefined | null,
  newResult: IScanSuccessResponse
) => {
  if (lastReport === undefined && lastResults === undefined) {
    return newResult;
  }

  const details = lastResults?.details as
    | IScanSuccessResponse["result"]
    | undefined
    | null;

  Object.values(InspectionTypeEnum).forEach((key) => {
    if (!newResult.result[key] || newResult.result[key]?.didPass === null) {
      // prefer the lastResults since it holds more information.
      if (details && details[key]?.didPass !== null) {
        newResult.result[key] = details[key];
      } else if (lastReport && lastReport[key] !== null) {
        // at least we have the last report.
        newResult.result[key]!.didPass = lastReport[key];
      }
    }
  });
  return newResult;
};

export const scanResult2ScanReport = (
  result: IScanSuccessResponse
): Omit<ScanReport, "createdAt" | "updatedAt" | "id"> => {
  return {
    uri: result.target,
    ipAddress: result.ipAddress,
    duration: result.duration,
    sut: result.sut,
    ...(Object.fromEntries(
      Object.entries(result.result).map(([key, value]) => [key, value.didPass])
    ) as {
      [key in InspectionType]: boolean;
    }),
  };
};

const handleReportDidChange = async (
  newReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">,
  lastScanDetails: Record<string, any> & { sut: string },
  result: IScanSuccessResponse,
  prisma: PrismaClient
) => {
  // if the report changed, we need to create a new one.
  const target = await prisma.target.upsert({
    where: { uri: newReport.uri },
    create: {
      lastScanDetails: {
        create: {
          details: lastScanDetails,
        },
      },
      uri: newReport.uri,
      queued: false,
      errorCount: 0,
      lastScan: result.timestamp,
      hostname: getHostnameFromUri(result.target),
    },
    update: {
      queued: false,
      lastScan: result.timestamp,
      errorCount: 0,
      lastScanDetails: {
        upsert: {
          create: {
            details: lastScanDetails,
          },
          update: {
            details: lastScanDetails,
          },
        },
      },
    },
  });

  await prisma.scanReport.create({
    data: newReport,
  });
  return toDTO({
    ...target,
    lastScan: target.lastScan || 0,
    details: lastScanDetails,
  });
};

// only create a new report if the didPass property changed.
const handleNewScanReport = async (
  result: IScanSuccessResponse,
  prisma: PrismaClient
): Promise<DTO<DetailedTarget>> => {
  // fetch the last existing report and check if we only need to update that one.
  const [lastReports, lastResults] = await Promise.all([
    prisma.scanReport.findMany({
      where: {
        uri: result.target,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    }),
    prisma.lastScanDetails.findFirst({
      where: { uri: result.target },
    }),
  ]);

  const lastReport = lastReports.length === 1 ? lastReports[0] : undefined;

  const newReport = combineReport(lastReport, scanResult2ScanReport(result));
  const lastScanDetails = scanResult2TargetDetails(
    combineResults(lastReport, lastResults, result)
  );

  if (
    lastReport &&
    config.socks5Proxy &&
    (newReport.duration > config.scanReportDurationThresholdUntilValidation ||
      reportDidChange(lastReport, newReport))
  ) {
    logger.debug(
      {
        target: result.target,
      },
      `report did change for ${result.target} or duration exceeds threshold of ${config.scanReportDurationThresholdUntilValidation} - verifying that the report changed`
    );
    // we should verify that the report changed.
    // lets start another scan, which will use a socks5 proxy configuration
    const validationResult = await scanService.scanRPC(
      crypto.randomUUID(),
      result.target,
      {
        refreshCache: true, // it makes no sense to use the cache here :)
        socks5Proxy: config.socks5Proxy,
      }
    );

    if (
      isScanSuccess(validationResult) &&
      reportDidChange(
        lastReport,
        combineReport(lastReport, scanResult2ScanReport(validationResult))
      )
    ) {
      // check if the validation response and the initial result are the same
      // if so, we can safely assume that the report did change.
      logger.debug(
        {
          target: result.target,
        },
        `report did change for ${result.target} - verified that the report changed`
      );
      return handleReportDidChange(
        newReport,
        lastScanDetails,
        validationResult,
        prisma
      );
    }
    // it was a scan error OR we were not able to verify that the report changed. - lets just return the last report.
    logger.info(
      {
        target: result.target,
      },
      `could not verify that the report changed for ${result.target} - returning last report`
    );
  } else if (!lastReport || reportDidChange(lastReport, newReport)) {
    return handleReportDidChange(newReport, lastScanDetails, result, prisma);
  }

  const target = await prisma.target.update({
    where: { uri: newReport.uri },
    data: {
      queued: false,
      lastScan: result.timestamp,
      errorCount: 0,
    },
  });

  return toDTO({
    ...target,
    details: scanResult2TargetDetails(result),
  }) as DTO<DetailedTarget>;
};

export const reportService = {
  handleNewScanReport,
  getChangedInspectionsOfCollections,
  reportDidChange,
};

// 2406.679ms
