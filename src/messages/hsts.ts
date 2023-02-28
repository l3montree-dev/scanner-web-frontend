import { HSTSValidationError } from "../inspection/result-enums/header.typings";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getHSTSReportMessage = (report: DTO<DetailedTarget>) => {
  const inspection = report.details["hsts"];
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return "Die Überprüfung des Strict-Transport-Security Headers konnte nicht durchgeführt werden.";
  } else if (inspection.didPass) {
    return "Strict-Transport-Security Header vorhanden und korrekt konfiguriert.";
  } else {
    switch (true) {
      case inspection.errors?.includes(HSTSValidationError.MissingHeader):
        return "Der Strict-Transport-Security Header ist nicht vorhanden.";
      case inspection.errors?.includes(HSTSValidationError.MissingMaxAge):
        return "Der Strict-Transport-Security Header ist vorhanden, enthält aber keinen max-age Parameter.";
      default:
        return "Strict-Transport-Security Header nicht vorhanden oder nicht korrekt konfiguriert.";
    }
  }
};
