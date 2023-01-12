import { DetailedDomain } from "../types";

export const getCAAReportMessage = (report: DetailedDomain) => {
  const inspection = report.details.CAA;
  const fqdn = report.details.sut;
  if (inspection === null || inspection === undefined) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${fqdn} konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `CAA Einträge sind für die Domain ${fqdn} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${fqdn} gefunden.`;
  }
};
