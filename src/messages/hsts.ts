import { IReport } from "../db/report";
import { HSTSValidationError } from "../inspection/header/hstsChecker";

export const getHSTSReportMessage = (report: IReport) => {
  const inspection = report.result["HSTS"];
  if (inspection.didPass === null) {
    return "Die Überprüfung des Strict-Transport-Security Headers konnte nicht durchgeführt werden.";
  } else if (inspection.didPass) {
    return "Strict-Transport-Security Header vorhanden und korrekt konfiguriert.";
  } else {
    switch (true) {
      case inspection.errors.includes(HSTSValidationError.MissingHeader):
        return "Der Strict-Transport-Security Header ist nicht vorhanden.";
      case inspection.errors.includes(HSTSValidationError.MissingMaxAge):
        return "Der Strict-Transport-Security Header ist vorhanden, enthält aber keinen max-age Parameter.";
      default:
        return "Strict-Transport-Security Header nicht vorhanden oder nicht korrekt konfiguriert.";
    }
  }
};
