import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getCAAReportMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return "Die Überprüfung nach CAA Einträgen konnte nicht durchgeführt werden.";
  }
  const inspection = report.details.caa;
  const uri = report.details.sut;
  if (inspection === null || inspection === undefined) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${uri} konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `CAA Einträge sind für die Domain ${uri} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${uri} gefunden.`;
  }
};
