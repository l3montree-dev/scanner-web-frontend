import { InspectionType, CertificateInspectionType } from "../inspection/scans";
import { DetailedDomain } from "../types";

export const tlsCriticalKeys: Array<InspectionType> = [
  CertificateInspectionType.ValidCertificate,
  CertificateInspectionType.MatchesHostname,
  CertificateInspectionType.NotRevoked,
];

export const getTLSv1_3ReportMessage = (report: DetailedDomain) => {
  const inspection = report.details["TLSv1_3"];

  if (
    report.details[CertificateInspectionType.ValidCertificate]?.didPass ===
    false
  ) {
    return `Der Server unterstützt das Protokoll TLS 1.3 nicht, da das Zertifikat ungültig ist.`;
  } else if (
    report.details[CertificateInspectionType.MatchesHostname]?.didPass === false
  ) {
    return `Der Server unterstützt das Protokoll TLS 1.3 nicht, da das Zertifikat nicht für die Domain ${report.details.sut} ausgestellt wurde.`;
  } else if (
    report.details[CertificateInspectionType.NotRevoked]?.didPass === false
  ) {
    return `Der Server unterstützt das Protokoll TLS 1.3 nicht, da das Zertifikat widerrufen wurde.`;
  }

  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Die Überprüfung des TLS 1.3 Protokolls konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `Der Server unterstützt das Protokoll TLS 1.3.`;
  } else {
    return `Der Server unterstützt das Protokoll TLS 1.3 nicht.`;
  }
};
