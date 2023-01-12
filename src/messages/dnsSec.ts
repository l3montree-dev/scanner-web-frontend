import { DetailedDomain } from "../types";

export const getDNSSecReportMessage = (report: DetailedDomain) => {
  const inspection = report.details.DNSSec;
  const fqdn = report.details.sut;
  if (inspection === null || inspection === undefined) {
    return `DNSSEC konnte für die Domain ${fqdn} nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `DNSSEC ist für die Domain ${fqdn} eingerichtet.`;
  } else {
    return `DNSSEC ist für die Domain ${fqdn} nicht eingerichtet.`;
  }
};
