import { DetailedScanReport } from "../types";

export const getDNSSecReportMessage = (report: DetailedScanReport) => {
  const inspection = report.DNSSec;
  if (inspection === null || inspection === undefined) {
    return `DNSSEC konnte für die Domain ${report.fqdn} nicht überprüft werden.`;
  } else if (inspection) {
    return `DNSSEC ist für die Domain ${report.fqdn} eingerichtet.`;
  } else {
    return `DNSSEC ist für die Domain ${report.fqdn} nicht eingerichtet.`;
  }
};
