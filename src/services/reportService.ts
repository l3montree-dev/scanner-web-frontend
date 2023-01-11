import { Domain, PrismaClient, ScanReport } from "@prisma/client";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import { IScanSuccessResponse } from "../types";

const reportDidChange = (
  lastReport: ScanReport,
  newReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">
) => {
  return Object.keys(InspectionTypeEnum).some((key) => {
    return (
      lastReport[key as InspectionType] !== newReport[key as InspectionType]
    );
  });
};

const scanResult2ScanReport = (
  result: IScanSuccessResponse
): Omit<ScanReport, "createdAt" | "updatedAt" | "id"> => {
  return {
    fqdn: result.fqdn,
    ipAddress: result.ipAddress,
    duration: result.duration,
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
): Promise<Domain> => {
  // fetch the last existing report and check if we only need to update that one.
  const lastReport = await prisma.scanReport.findMany({
    where: {
      fqdn: result.fqdn,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });
  const newReport = scanResult2ScanReport(result);
  if (lastReport.length !== 1 || reportDidChange(lastReport[0], newReport)) {
    // if the report changed, we need to create a new one.

    const createPromise = prisma.scanReport.create({
      data: { ...newReport },
    });
    // update the domain as well.
    const [domain] = await Promise.all([
      prisma.domain.update({
        where: { fqdn: newReport.fqdn },
        data: {
          queued: false,
          lastScan: result.timestamp,
          details: result.result as Record<string, any>,
        },
      }),
      createPromise,
    ]);
    return domain;
  }

  // mark the last report valid until the next scan.
  return await prisma.domain.update({
    where: { fqdn: newReport.fqdn },
    data: {
      queued: false,
      lastScan: result.timestamp,
      details: result.result as Record<string, any>,
    },
  });
};

export const reportService = {
  handleNewScanReport,
};
