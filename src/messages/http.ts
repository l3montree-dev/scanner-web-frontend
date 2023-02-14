import { HttpInspectionType } from "../inspection/scans";
import { DetailedDomain, ErrorCode } from "../types";

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

export const getHttpMessage = (report: DetailedDomain) => {
  switch (report.details[HttpInspectionType.HTTP]?.didPass) {
    case null:
      if (
        immediateActionHTTPErrors.includes(
          report.details[HttpInspectionType.HTTP]?.actualValue.error.code
        )
      ) {
        return getErrorMessage(
          report.details[HttpInspectionType.HTTP]?.actualValue.error.code
        );
      }
      return "Die Verbindung konnte nicht überprüft werden.";
    case false:
      return `Die Verbindung konnte nicht hergestellt werden.`;
    case true:
      return `Eine Verbindung konnte hergestellt werden.`;
    default:
      return "Die Verbindung konnte nicht überprüft werden.";
  }
};
