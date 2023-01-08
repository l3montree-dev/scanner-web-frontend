import { ScanReport } from "@prisma/client";

export const getCAAReportMessage = (report: ScanReport) => {
  const inspection = report.CAA;
  if (inspection === null || inspection === undefined) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${report.fqdn} konnte nicht durchgeführt werden.`;
  } else if (inspection) {
    return `CAA Einträge sind für die Domain ${report.fqdn} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${report.fqdn} gefunden.`;
  }
};
