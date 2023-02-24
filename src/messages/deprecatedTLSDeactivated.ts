import { DetailedTarget } from "../types";

export const getDeprecatedTLSDeactivatedReportMessage = (
  report: DetailedTarget
) => {
  const inspection = report.details["deprecatedTLSDeactivated"];
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return "Die Überprüfung der Protokolle TLS 1.1 und älter sowie SSL konnte nicht durchgeführt werden.";
  } else if (inspection.didPass) {
    return "Die Protokolle TLS 1.1 und älter sowie SSL sind deaktiviert.";
  } else {
    return "Die Protokolle TLS 1.1 und älter sowie SSL sind nicht deaktiviert.";
  }
};
