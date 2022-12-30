import { IReport } from "../types";

export default function getRPKIReportMessage(report: IReport) {
  const inspection = report.result["RPKI"];
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Der RPKI Status der Domain ${report.fqdn} konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    return `Der IP-Adressen Prefix ${inspection.actualValue.prefix} (ASN: ${inspection.actualValue.asn}) weist ein valide Signatur auf.`;
  } else {
    return `Der IP-Adressen Prefix ${inspection.actualValue.prefix} (ASN: ${inspection.actualValue.asn}) weist keine Signatur auf.`;
  }
}
