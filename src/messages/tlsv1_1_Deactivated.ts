import { IReport } from "../types";

export const getTLSv1_1_DeactivatedReportMessage = (report: IReport) => {
  const inspection = report.result["TLSv1_1_Deactivated"];
  if (inspection.didPass === null) {
    return "Die Überprüfung der Protokolle TLS 1.1 und älter sowie SSL konnte nicht durchgeführt werden.";
  } else if (inspection.didPass) {
    return "Die Protokolle TLS 1.1 und älter sowie SSL sind deaktiviert.";
  } else {
    return "Die Protokolle TLS 1.1 und älter sowie SSL sind nicht deaktiviert.";
  }
};
