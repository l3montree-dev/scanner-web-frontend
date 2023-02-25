import { CertificateInspectionType } from "../inspection/scans";
import { DetailedTarget } from "../types";

export const getMatchesHostnameMessage = (report: DetailedTarget) => {
  if (
    report.details[CertificateInspectionType.MatchesHostname]?.didPass === false
  ) {
    return `Das Zertifikat des Servers ist nicht für die Domain ${report.details.sut} ausgestellt worden.`;
  }
  return `Das Zertifikat des Servers ist für die Domain ${report.details.sut} ausgestellt worden.`;
};
