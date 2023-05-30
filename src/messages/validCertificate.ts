import { CertificateInspectionType } from "../scanner/scans";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getValidCertificateMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return `Das Zertifikat der Domain oder des Weiterleitungsziels konnte nicht überprüft werden.`;
  }
  if (
    report.details[CertificateInspectionType.ValidCertificate]?.didPass ===
    false
  ) {
    return `"Das Zertifikat der Domain oder des Weiterleitungsziels ist abgelaufen.`;
  }
  return `Das Zertifikat der Domain oder des Weiterleitungsziels ist valide.`;
};
