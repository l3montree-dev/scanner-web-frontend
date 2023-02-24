import { DetailedTarget } from "../types";
import { getHostnameFromUri } from "../utils/common";

export const getDNSSecReportMessage = (report: DetailedTarget) => {
  const inspection = report.details.DNSSec;
  const hostname = getHostnameFromUri(report.details.sut);
  if (inspection === null || inspection === undefined) {
    return `DNSSEC konnte für die Domain ${hostname} nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `DNSSEC ist für die Domain ${hostname} eingerichtet.`;
  } else {
    return `DNSSEC ist für die Domain ${hostname} nicht eingerichtet.`;
  }
};
