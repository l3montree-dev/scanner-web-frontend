import { DetailedDomain } from "../types";

export const getCAAReportMessage = (report: DetailedDomain) => {
  const inspection = report.details.CAA;
  if (inspection === null || inspection === undefined) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${report.fqdn} konnte nicht durchgeführt werden.`;
  } else if (inspection) {
    return `CAA Einträge sind für die Domain ${report.fqdn} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${report.fqdn} gefunden.`;
  }
};
