import { DetailedScanReport } from "../types";

export const getTLSv1_3ReportMessage = (report: DetailedScanReport) => {
  const inspection = report.details["TLSv1_3"];
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Die Überprüfung des TLS 1.3 Protokolls konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `Der Server unterstützt das Protokoll TLS 1.3.`;
  } else {
    return `Der Server unterstützt das Protokoll TLS 1.3 nicht.`;
  }
};
