import { Model } from "mongoose";
import { ModelsType } from "../db/models";
import { InspectionType } from "../inspection/scans";
import { IReport } from "../types";

const reportDidChange = (
  lastReport: Omit<IReport, "createdAt" | "updatedAt">,
  newReport: Omit<IReport, "createdAt" | "updatedAt">
) => {
  // check if the didPass property changed.
  return Object.entries(lastReport.result).some(([key, value]) => {
    return newReport.result[key as InspectionType]?.didPass !== value.didPass;
  });
};

// only create a new report if the didPass property changed.
export const handleNewScanReport = async (
  newReport: Omit<IReport, "createdAt" | "updatedAt">,
  db: ModelsType
) => {
  // fetch the last existing report and check if we only need to update that one.
  const lastReport = await db.Report.findOne({
    fqdn: newReport.fqdn,
    ipV4AddressNumber: newReport.ipV4AddressNumber,
  })
    .sort({
      lastScan: -1,
    })
    .lean();

  if (!lastReport || reportDidChange(lastReport, newReport)) {
    // if the report changed, we need to create a new one.
    const report = new db.Report(newReport);
    return (await report.save()).toObject();
  }
  // mark the last report valid until the next scan.
  const now = newReport.validFrom;
  await Promise.all([
    db.Report.updateOne({ _id: lastReport._id }, { lastScan: now }).lean(),
    db.Domain.updateOne(
      { fqdn: newReport.fqdn, ipV4AddressNumber: newReport.ipV4AddressNumber },
      { lastScan: now, queued: false }
    ).lean(),
  ]);
  return {
    ...lastReport,
    lastScan: now,
  };
};
