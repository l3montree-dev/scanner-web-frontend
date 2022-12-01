import { IDetailedReport } from "../db/report";

export const getCAAReportMessage = (report: IDetailedReport) => {
  const inspection = report.result["CAA"];
  if (inspection.didPass === null) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${report.fqdn} konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `CAA Einträge sind für die Domain ${report.fqdn} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${report.fqdn} gefunden.`;
  }
};
