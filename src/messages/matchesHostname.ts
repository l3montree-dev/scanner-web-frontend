import { CertificateInspectionType } from "../scanner/scans";
import { getSUTFromResponse } from "../services/sarifTransformer";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getMatchesHostnameMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return `Das Zertifikat des Servers konnte nicht überprüft werden.`;
  }

  const sut = getSUTFromResponse(report.details);
  const inspection = report.details.runs[0].results.find(
    (r) => r.ruleId === CertificateInspectionType.MatchesHostname
  );

  switch (inspection?.kind) {
    case "pass":
      return `Das Zertifikat des Servers ist für die Domain ${sut} ausgestellt worden.`;
    case "fail":
      return `Das Zertifikat des Servers ist nicht für die Domain ${sut} ausgestellt worden.`;
    default:
      return `Das Zertifikat des Servers konnte nicht überprüft werden.`;
  }
};
