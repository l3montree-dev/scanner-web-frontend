import { DomainInspectionType, InspectionResult } from "../Inspector";
import { DOHResponse } from "./dohResponse";

/**
 *
 * @requirements
 * REUQIRED: The "CAA" records are present.
 * REQUIRED: The "CAA" flag is set to 0 (not critical).
 * REUQIRED: The "CAA" "issue" (value not ";") and/ or "issuewild" properties are present.
 * REUQIRED: The "CAA" "iodef" property is present (mailto: or https://).
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
  return new InspectionResult(
    DomainInspectionType.CAA,
    // status should be 0 ("SUCCESS") and AD flag should be set ("Authenticated Data")
    response.Status === 0 &&
      !!response.Answer?.some((answer) => answer.type === 257),
    {
      CertificateAuthority: response.Answer?.filter(
        (answer) => answer.type === 257
      ),
    }
  );
};
