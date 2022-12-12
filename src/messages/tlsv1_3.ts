import { IReport } from "../types";

export const getTLSv1_3ReportMessage = (report: IReport) => {
  const inspection = report.result["TLSv1_3"];
  if (inspection.didPass === null) {
    return `Die Überprüfung des TLS 1.3 Protokolls konnte nicht durchgeführt werden.`;
  } else if (inspection.didPass) {
    return `Der Server unterstützt das Protokoll TLS 1.3.`;
  } else {
    return `Der Server unterstützt das Protokoll TLS 1.3 nicht.`;
  }
};
