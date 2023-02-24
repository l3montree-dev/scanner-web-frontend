import { DetailedTarget } from "../types";

export const getCAAReportMessage = (report: DetailedTarget) => {
  const inspection = report.details.CAA;
  const uri = report.details.sut;
  if (inspection === null || inspection === undefined) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${uri} konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `CAA Einträge sind für die Domain ${uri} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${uri} gefunden.`;
  }
};
