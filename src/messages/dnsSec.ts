import { IReport } from "../db/report";

export const getDNSSecReportMessage = (report: IReport) => {
  const inspection = report.result["DNSSec"];
  if (inspection.didPass === null) {
    return `DNSSEC konnte für die Domain ${report.fqdn} nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `DNSSEC ist für die Domain ${report.fqdn} eingerichtet.`;
  } else {
    return `DNSSEC ist für die Domain ${report.fqdn} nicht eingerichtet.`;
  }
};
