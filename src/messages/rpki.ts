import { IDetailedReport } from "../types";

export default function getRPKIReportMessage(report: IDetailedReport) {
  const inspection = report.result["RPKI"];
  if (inspection.didPass === null) {
    return `Der RPKI Status der Domain ${report.fqdn} konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `Der IP-Adressen Prefix ${inspection.actualValue.prefix} ist gültig und gehört zum ASN ${inspection.actualValue.asn}.`;
  } else {
    return `Der IP-Adressen Prefix ${inspection.actualValue.prefix} ist ungültig und gehört nicht zum ASN ${inspection.actualValue.asn}.`;
  }
}
