import { CertificateInspectionType } from "../inspection/scans";
import { DetailedDomain } from "../types";

export const getMatchesHostnameMessage = (report: DetailedDomain) => {
  if (
    report.details[CertificateInspectionType.MatchesHostname]?.didPass === false
  ) {
    return `Das Zertifikat des Servers ist nicht für die Domain ${report.details.sut} ausgestellt worden.`;
  }
  return `Das Zertifikat des Servers ist für die Domain ${report.details.sut} ausgestellt worden.`;
};
