import { DomainInspectionType, InspectionResult } from "../Inspector";
import { DOHResponse } from "./dohResponse";

const caaParser = (
  dataString: string
): {
  CAA?: string;
  issue?: string;
  iodef?: string;
  issuewild?: string;
} => {
  const data = dataString.split(" ");
  let obj: {
    CAA?: string;
    issue?: string;
    iodef?: string;
    issuewild?: string;
  } = {};
  for (let i = 0; i < data.length; i += 2) {
    obj[data[i] as keyof typeof obj] = data[i + 1];
  }
  return obj;
};
/**
 *
 * @requirements
 * REQUIRED: The "CAA" records are present.
 * REQUIRED: The "CAA" flag is set to 0 (not critical).
 * REQUIRED: The "CAA" "issue" (value not ";") and/ or "issuewild" properties are present.
 * REQUIRED: The "CAA" "iodef" property is present (mailto: or https://).
 *
 * Base Format: CAA <flags> <tag> <value>
 * Example: CAA 0 issue "letsencrypt.org"
 * Example: CAA 0 issue "ca1.example.net; account=230123"
 * Example: CAA 0 issuewild "letsencrypt.org"
 * Example: CAA 0 iodef "mailto:opensource@neuland-homeland.de"
 * Example: CAA 0 iodef "https://iodef.example.com/"
 * Bad Example: CAA 0 issue ";"
 * Bad Example: CAA 1 issue "letsencrypt.org"
 * Malformed Example: CAA 0 issue "%%%%%"
 *
 */
export const caaChecker = (response: DOHResponse): InspectionResult => {
  const caaRecords = response.Answer?.filter((a) => a.type === 257)
    .map((answer) => answer.data)
    .map((data) => `CAA ${data}`)
    .map(caaParser);

  if (!caaRecords || caaRecords.length === 0) {
    return new InspectionResult(DomainInspectionType.CAA, false, {
      caaRecords: response.Answer?.filter((a) => a.type === 257),
    });
  }

  const issueAndIssueWildProperty = caaRecords
    .map((r) => r.issue || r.issuewild)
    .filter((issue): issue is string => !!issue);

  const iodefProperty = caaRecords
    .map((r) => r.iodef)
    .filter((iodef): iodef is string => !!iodef);

  const caaFlagIsZero = caaRecords.every((record) => record.CAA === "0");

  console.log({ caaFlagIsZero, issueAndIssueWildProperty, iodefProperty });
  return new InspectionResult(
    DomainInspectionType.CAA,
    Boolean(
      caaFlagIsZero &&
        issueAndIssueWildProperty.length > 0 &&
        issueAndIssueWildProperty.every((issue) => issue !== '";"') &&
        iodefProperty.length > 0 &&
        iodefProperty.every((iodef) => {
          const val = iodef.replaceAll('"', "");
          return (
            val.startsWith("mailto:") ||
            val.startsWith("https://") ||
            val.startsWith("http://")
          );
        })
    ),
    {
      caaRecords: response.Answer?.filter((a) => a.type === 257),
    }
  );
};
