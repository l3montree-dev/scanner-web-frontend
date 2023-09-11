import { DomainInspectionType } from "../scanner/scans";
import { getSUTFromResponse } from "../services/sarifTransformer";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getCAAReportMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return "Die Überprüfung nach CAA Einträgen konnte nicht durchgeführt werden.";
  }
  const inspection = report.details.runs[0].results.find(
    (r) => r.ruleId === DomainInspectionType.CAA
  );
  const uri = getSUTFromResponse(report.details);
  if (
    inspection === null ||
    inspection === undefined ||
    inspection.kind === "notApplicable"
  ) {
    return `Die Überprüfung nach CAA Einträgen für die Domain ${uri} konnte nicht durchgeführt werden.`;
  } else if (inspection.kind === "pass") {
    return `CAA Einträge sind für die Domain ${uri} eingerichtet.`;
  } else {
    return `Es wurden keine CAA Einträge für die Domain ${uri} gefunden.`;
  }
};
