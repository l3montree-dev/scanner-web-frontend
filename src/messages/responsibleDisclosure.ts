import { IDetailedReport } from "../db/report";
import { ResponsibleDisclosureValidationError } from "../inspection/result-enums/organizational.typings";

export const getResponsibleDisclosureReportMessage = (
  report: IDetailedReport
) => {
  const inspection = report.result["ResponsibleDisclosure"];
  if (inspection.didPass === null) {
    return `Die Datei ${report.fqdn}/.well-known/security.txt konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden und enthält die nötigen Einträge.`;
  } else {
    switch (true) {
      case inspection.errors.includes(
        ResponsibleDisclosureValidationError.MissingResponsibleDisclosure
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist nicht vorhanden.`;
      case inspection.errors.includes(
        ResponsibleDisclosureValidationError.MissingContactField
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden, enthält aber keinen Kontakt.`;
      case inspection.errors.includes(
        ResponsibleDisclosureValidationError.InvalidExpiresField
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden, enthält aber keinen gültigen Expires Eintrag.`;
      case inspection.errors.includes(
        ResponsibleDisclosureValidationError.Expired
      ):
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden, aber abgelaufen.`;

      default:
        return `Die Datei ${report.fqdn}/.well-known/security.txt ist nicht vorhanden oder enthält nicht die nötigen Einträge.`;
    }
  }
};
