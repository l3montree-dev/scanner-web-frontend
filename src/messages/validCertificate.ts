import { CertificateInspectionType } from "../inspection/scans";
import { DetailedDomain } from "../types";

export const getValidCertificateMessage = (report: DetailedDomain) => {
  if (
    report.details[CertificateInspectionType.ValidCertificate]?.didPass ===
    false
  ) {
    return `"Das Zertifikat der Domain oder des Weiterleitungsziels ist abgelaufen.`;
  }
  return `Das Zertifikat der Domain oder des Weiterleitungsziels ist valide.`;
};
