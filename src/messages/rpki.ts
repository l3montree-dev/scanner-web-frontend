import { DetailedDomain } from "../types";

export default function getRPKIReportMessage(report: DetailedDomain) {
  const inspection = report.details["RPKI"];
  const fqdn = report.details.sut;
  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Der RPKI Status der Domain ${fqdn} konnte nicht überprüft werden.`;
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
      return `Alle IP-Adressen Präfixe ${inspection.actualValue
        .map((v) => v.prefix)
        .join(", ")} (ASN: ${inspection.actualValue
        .map((v) => v.asn)
        .join(", ")}) weisen valide Signaturen auf.`;
    }

    return `Das IP-Adressen Präfix ${actualValue.prefix} (ASN: ${actualValue.asn}) weist ein valide Signatur auf.`;
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
      return `Mindestens eines der IP-Adressen Präfixe ${inspection.actualValue
        .map((v) => v.prefix)
        .join(", ")} (ASN: ${inspection.actualValue
        .map((v) => v.asn)
        .join(", ")}) weist keine valide Signatur auf.`;
    }
    return `Das IP-Adressen Präfix ${actualValue.prefix} (ASN: ${actualValue.asn}) weist keine Signatur auf.`;
  }
}
