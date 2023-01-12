import { ResponsibleDisclosureValidationError } from "../inspection/result-enums/organizational.typings";
import { DetailedDomain } from "../types";

export const getResponsibleDisclosureReportMessage = (
  report: DetailedDomain
) => {
  const inspection = report.details["ResponsibleDisclosure"];
  const fqdn = report.details.sut;
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Die Datei ${fqdn}/.well-known/security.txt konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `Die Datei ${fqdn}/.well-known/security.txt ist vorhanden und enthält die nötigen Einträge.`;
  } else {
    switch (true) {
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.MissingContactField
      ):
        return `Die Datei ${fqdn}/.well-known/security.txt ist vorhanden, enthält aber keinen Kontakt.`;
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.InvalidExpiresField
      ):
        return `Die Datei ${fqdn}/.well-known/security.txt ist vorhanden, enthält aber keinen gültigen Expires Eintrag.`;
      case inspection.errors?.includes(
        ResponsibleDisclosureValidationError.Expired
      ):
        return `Die Datei ${fqdn}/.well-known/security.txt ist vorhanden, aber abgelaufen.`;

      case inspection?.errors?.includes(
        ResponsibleDisclosureValidationError.MissingResponsibleDisclosure
      ):
      default:
        return `Die Datei ${fqdn}/.well-known/security.txt ist nicht vorhanden.`;
    }
  }
};
