import { ResponsibleDisclosureValidationError } from "../inspection/result-enums/organizational.typings";
import { DetailedScanReport } from "../types";

export const getResponsibleDisclosureReportMessage = (
  report: DetailedScanReport
) => {
  const inspection = report.details["ResponsibleDisclosure"];
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Die Datei ${report.fqdn}/.well-known/security.txt konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden und enthält die nötigen Einträge.`;
  } else {
    switch (true) {
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.MissingContactField
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden, enthält aber keinen Kontakt.`;
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.InvalidExpiresField
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden, enthält aber keinen gültigen Expires Eintrag.`;
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.Expired
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden, aber abgelaufen.`;

      case inspection?.errors?.includes(
        ResponsibleDisclosureValidationError.MissingResponsibleDisclosure
      ):
      default:
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist nicht vorhanden.`;
    }
  }
};
