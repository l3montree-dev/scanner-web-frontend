import { HttpInspectionType } from "../scanner/scans";
import { DetailedTarget, ErrorCode } from "../types";
import { DTO } from "../utils/server";

export const immediateActionHTTPErrors = [
  "EPROTO",
  "ERR_NON_2XX_3XX_RESPONSE",
  "ECONNRESET",
  "ECONNREFUSED",
];

export const getErrorMessage = (code: ErrorCode) => {
  switch (code) {
    case "EPROTO":
      return "Es ist ein Protokoll-Fehler im Aufbau einer verschlüsselten Verbindung aufgetreten.";
    case "ERR_NON_2XX_3XX_RESPONSE":
      return "Die Domain oder das Weiterleitungsziel konnte per HTTP nicht erreicht werden (kein 2XX oder 3XX Status).";
    case "ETIMEDOUT":
      return "Eine Anfrage wurde nicht innerhalb von 10 Sekunden beantwortet (Timeout).";
    case "ESERVFAIL":
      return "Der DNS-Server konnte die Anfrage nicht beantworten. Es konnte keine IP-Adresse für die Domain oder das Weiterleitungsziel ermittelt werden.";
    case "ENOTFOUND":
      return "Die Domain oder das Weiterleitungsziel konnte nicht aufgelöst werden. Es konnte keine IP-Adresse ermittelt werden.";
    case "ECONNREFUSED":
      return "Die Domain oder das Weiterleitungsziel konnte nicht erreicht werden. Der Server lehnt die Verbindung ab.";
    case "ECONNRESET":
      return "Die Domain oder das Weiterleitungsziel konnte nicht erreicht werden. Der Server hat die Verbindung zurückgesetzt.";
    case "EHOSTUNREACH":
      return "Die Domain oder das Weiterleitungsziel konnte nicht erreicht werden. Der Server ist nicht erreichbar.";
    case "CERT_HAS_EXPIRED":
      return "Das Zertifikat der Domain oder des Weiterleitungsziels ist abgelaufen.";
    default:
      return "Unbekannter Fehler.";
  }
};

export const getHttpMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return "Die Überprüfung der HTTP Verbindung konnte nicht durchgeführt werden.";
  }
  const inspection = report.details.runs[0].results.find(
    (r) => r.ruleId === HttpInspectionType.HTTP
  );

  switch (inspection?.kind) {
    case "notApplicable":
      if (
        immediateActionHTTPErrors.includes(
          inspection.properties.actualValue.error.code
        )
      ) {
        return getErrorMessage(inspection.properties.actualValue.error.code);
      }
      return "Die Verbindung konnte nicht überprüft werden.";
    case "fail":
      return `Die Verbindung konnte nicht hergestellt werden.`;
    case "pass":
      return `Eine Verbindung konnte hergestellt werden.`;
    default:
      return "Die Verbindung konnte nicht überprüft werden.";
  }
};
