import { CertificateInspectionType } from "../inspection/scans";
import { DetailedDomain } from "../types";

export const getValidCertificateMessage = (report: DetailedDomain) => {
  if (
    report.details[CertificateInspectionType.ValidCertificate]?.didPass ===
    false
  ) {
    return `Das Zertifikat des Servers ist abgelaufen.`;
  }
  return `Das Zertifikat des Servers ist valide.`;
};
