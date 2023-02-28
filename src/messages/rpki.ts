import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";

const holderStr = (holder?: string) => {
  if (holder) {
    // prepend a space
    return ` ${holder}`;
  }
  return "";
};

export default function getRPKIReportMessage(report: DTO<DetailedTarget>) {
  const inspection = report.details["rpki"];
  const uri = report.details.sut;

  if (inspection?.didPass === null || inspection?.didPass === undefined) {
    return `Der RPKI Status der Domain ${uri} konnte nicht überprüft werden.`;
  } else if (inspection.didPass) {
    let actualValue: {
      prefix: string;
      asn: number;
      holder: string;
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
        .join(", ")} (AS: ${inspection.actualValue
        .map((v) => `${v.asn}${holderStr(v.holder)}`)
        .join(", ")}) weisen valide Signaturen auf.`;
    }

    return `Das IP-Adressen Präfix ${actualValue.prefix} (AS: ${
      actualValue.asn
    }${holderStr(actualValue.holder)}) weist eine valide Signatur auf.`;
  } else {
    let actualValue: {
      prefix: string;
      asn: number;
      holder: string;
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
        .join(", ")} (AS: ${inspection.actualValue
        .map((v) => `${v.asn}${holderStr(v.holder)}`)
        .join(", ")}) weist keine valide Signatur auf.`;
    }
    return `Das IP-Adressen Präfix ${actualValue.prefix} (AS: ${
      actualValue.asn
    }${holderStr(actualValue.holder)}) weist keine Signatur auf.`;
  }
}
