import { PrismaClient, ScanReport } from "@prisma/client";
import { InspectionType, InspectionTypeEnum } from "../inspection/scans";
import { DetailedDomainWithScanResult, IScanSuccessResponse } from "../types";
import { DTO, toDTO } from "../utils/server";

const reportDidChange = (
  lastReport: ScanReport,
  newReport: Omit<ScanReport, "createdAt" | "updatedAt" | "id">
) => {
  const res = Object.keys(InspectionTypeEnum).some((key) => {
    return (
      lastReport[key as InspectionType] !== newReport[key as InspectionType]
    );
  });

  return res;
};

const scanResult2ScanReport = (
  result: IScanSuccessResponse
): Omit<ScanReport, "createdAt" | "updatedAt" | "id"> => {
  return {
    fqdn: result.fqdn,
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
  shouldBeMonitoredIfNotExist: boolean,
  prisma: PrismaClient
): Promise<DTO<DetailedDomainWithScanResult>> => {
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
    const domain = await prisma.domain.upsert({
      where: { fqdn: newReport.fqdn },
      create: {
        fqdn: newReport.fqdn,
        queued: false,
        lastScan: result.timestamp,
        monitor: shouldBeMonitoredIfNotExist,
        details: {
          ...result.result,
          // save the subject under test inside the details
          sut: result.sut ?? result.fqdn,
        } as Record<string, any>,
        group: "unknown",
      },
      update: {
        queued: false,
        lastScan: result.timestamp,
        errorCount: 0,
        details: {
          ...result.result,
          // save the subject under test inside the details
          sut: result.sut ?? result.fqdn,
        } as Record<string, any>,
      },
    });

    const scanReport = await prisma.scanReport.create({
      data: { ...newReport },
    });
    return {
      ...toDTO(domain),
      scanReport: toDTO(scanReport),
    };
  }

  const domain = await prisma.domain.update({
    where: { fqdn: newReport.fqdn },
    data: {
      queued: false,
      lastScan: result.timestamp,
      errorCount: 0,
      details: {
        ...result.result,
        // save the subject under test inside the details
        sut: result.sut ?? result.fqdn,
      } as Record<string, any>,
    },
  });

  return {
    ...toDTO(domain),
    scanReport: toDTO(lastReport[0]),
  };
};

export const reportService = {
  handleNewScanReport,
};
