import { DomainInspectionType, InspectionResult } from "../Inspector";
import { DOHResponse } from "./dohResponse";

/**
 *
 * @requirements
 * REQUIRED: "AD" MUST be set to "true".
 * REQUIRED: "Status" MUST be set to "0" with Comment "NOERROR"
 * REQUIRED: "CD" MUST be set to "false".
 * REQUIRED: the "type": 46, RRSIG record MUST be present.
 * Additional Resource: https://developers.google.com/speed/public-dns/faq#dnssec
 * Additional Resource: https://developers.google.com/speed/public-dns/faq#gdns_validation_failure
 * Additional Resource: https://developers.google.com/speed/public-dns/faq#dnshttps_dnssec
 *
 * Example response: ./src/inspection/domain/dnsSecValidExampleResponse.json
 *
 */
export const dnsSecChecker = (response: DOHResponse): InspectionResult => {
  return new InspectionResult(
    DomainInspectionType.DNSSec,
    // status should be 0 ("SUCCESS") and AD flag should be set ("Authenticated Data")
    response.Status === 0 &&
      response.AD &&
      !response.CD &&
      !!response.Answer?.some((a) => a.type === 46),
    {
      DNSSecSignature: response.Answer?.find((a) => a.type === 46)?.data,
    }
  );
};
