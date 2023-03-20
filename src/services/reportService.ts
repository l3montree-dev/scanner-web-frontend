import { PrismaClient, ScanReport } from "@prisma/client";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import { DetailedTarget, IScanSuccessResponse } from "../types";
import { getHostnameFromUri, limitStringValues } from "../utils/common";
import { DTO, toDTO } from "../utils/server";

const reportDidChange = (
  lastReport: ScanReport,
  newReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">
) => {
  const res = Object.values(InspectionTypeEnum).some((key) => {
    return lastReport[key] !== newReport[key];
  });

  return res;
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
    if (newReport[key] === null) {
      newReport[key] = lastReport[key];
    }
  });
  return newReport;
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

// only create a new report if the didPass property changed.
const handleNewScanReport = async (
  result: IScanSuccessResponse,
  prisma: PrismaClient
): Promise<DTO<DetailedTarget>> => {
  // fetch the last existing report and check if we only need to update that one.
  const lastReport = await prisma.scanReport.findMany({
    where: {
      uri: result.target,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  const newReport = combineReport(
    lastReport.length === 1 ? lastReport[0] : undefined,
    scanResult2ScanReport(result)
  );
  const lastScanDetails = scanResult2TargetDetails(result);

  if (lastReport.length === 0 || reportDidChange(lastReport[0], newReport)) {
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
        group: "unknown",
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
  }

  const target = await prisma.target.update({
    where: { uri: newReport.uri },
    data: {
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

  return toDTO({
    ...target,
    details: scanResult2TargetDetails(result),
  }) as DTO<DetailedTarget>;
};

export const reportService = {
  handleNewScanReport,
};
