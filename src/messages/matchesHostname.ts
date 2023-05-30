import { CertificateInspectionType } from "../scanner/scans";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getMatchesHostnameMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return `Das Zertifikat des Servers konnte nicht überprüft werden.`;
  }

  if (
    report.details[CertificateInspectionType.MatchesHostname]?.didPass === false
  ) {
    return `Das Zertifikat des Servers ist nicht für die Domain ${report.details.sut} ausgestellt worden.`;
  }
  return `Das Zertifikat des Servers ist für die Domain ${report.details.sut} ausgestellt worden.`;
};
