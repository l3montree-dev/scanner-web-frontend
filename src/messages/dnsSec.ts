import { DetailedTarget } from "../types";
import { getUnicodeHostnameFromUri } from "../utils/common";
import { DTO } from "../utils/server";

export const getDNSSecReportMessage = (report: DTO<DetailedTarget>) => {
  if (report.details === null) {
    return "DNSSEC konnte nicht überpüft werden.";
  }
  const inspection = report.details.dnsSec;
  const hostname = getUnicodeHostnameFromUri(report.details.sut);
  if (inspection === null || inspection === undefined) {
    return `DNSSEC konnte für die Domain ${hostname} nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `DNSSEC ist für die Domain ${hostname} eingerichtet.`;
  } else {
    return `DNSSEC ist für die Domain ${hostname} nicht eingerichtet.`;
  }
};
