import { DetailedDomain } from "../types";

export default function getRPKIReportMessage(report: DetailedDomain) {
  const inspection = report.details["RPKI"];
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Der RPKI Status der Domain ${report.fqdn} konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    let actualValue: {
      prefix: string;
      asn: number;
    } = inspection.actualValue as any;
    if (
      inspection.actualValue instanceof Array &&
      inspection.actualValue.length === 1
    ) {
      actualValue = inspection.actualValue[0];
    } else if (
      inspection.actualValue instanceof Array &&
      inspection.actualValue.length > 1
    ) {
      return `Alle IP-Adressen Prefixe ${inspection.actualValue
        .map((v) => v.prefix)
        .join(", ")} (ASN: ${inspection.actualValue
        .map((v) => v.asn)
        .join(", ")}) weisen valide Signaturen auf.`;
    }

    return `Der IP-Adressen Prefix ${actualValue.prefix} (ASN: ${actualValue.asn}) weist ein valide Signatur auf.`;
  } else {
    let actualValue: {
      prefix: string;
      asn: number;
    } = inspection.actualValue as any;
    if (
      inspection.actualValue instanceof Array &&
      inspection.actualValue.length === 1
    ) {
      actualValue = inspection.actualValue[0];
    } else if (
      inspection.actualValue instanceof Array &&
      inspection.actualValue.length > 1
    ) {
      return `Mindestens einer der IP-Adressen Prefixe ${inspection.actualValue
        .map((v) => v.prefix)
        .join(", ")} (ASN: ${inspection.actualValue
        .map((v) => v.asn)
        .join(", ")}) weist keine valide Signatur auf.`;
    }
    return `Der IP-Adressen Prefix ${actualValue.prefix} (ASN: ${actualValue.asn}) weist keine Signatur auf.`;
  }
}
