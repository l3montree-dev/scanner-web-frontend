import { ResponsibleDisclosureValidationError } from "../inspection/result-enums/organizational.typings";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

export const getResponsibleDisclosureReportMessage = (
  report: DTO<DetailedTarget>
) => {
  if (report.details === null) {
    return `Die Datei /.well-known/security.txt konnte nicht überprüft werden.`;
  }
  const inspection = report.details["responsibleDisclosure"];
  const uri = new URL(`http://${report.details.sut}`).hostname;
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Die Datei ${uri}/.well-known/security.txt konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `Die Datei ${uri}/.well-known/security.txt ist vorhanden und enthält die nötigen Einträge.`;
  } else {
    switch (true) {
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.MissingContactField
      ):
        return `Die Datei ${uri}/.well-known/security.txt ist vorhanden, enthält aber keinen Kontakt.`;
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.InvalidExpiresField
      ):
        return `Die Datei ${uri}/.well-known/security.txt ist vorhanden, enthält aber keinen gültigen Expires Eintrag.`;
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.Expired
      ):
        return `Die Datei ${uri}/.well-known/security.txt ist vorhanden, aber abgelaufen.`;

      case inspection?.errors?.includes(
        ResponsibleDisclosureValidationError.MissingResponsibleDisclosure
      ):
      default:
        return `Die Datei ${uri}/.well-known/security.txt ist nicht vorhanden.`;
    }
  }
};
