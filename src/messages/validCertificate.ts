import { CertificateInspectionType } from "../inspection/scans";
import { DetailedTarget } from "../types";

export const getValidCertificateMessage = (report: DetailedTarget) => {
  if (
    report.details[CertificateInspectionType.ValidCertificate]?.didPass ===
    false
  ) {
    return `"Das Zertifikat der Domain oder des Weiterleitungsziels ist abgelaufen.`;
  }
  return `Das Zertifikat der Domain oder des Weiterleitungsziels ist valide.`;
};
