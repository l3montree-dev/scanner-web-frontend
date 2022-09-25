import { DomainInspectionType, InspectionResult } from "../Inspector";
import { DOHResponse } from "./dohResponse";

export const dnsSecChecker = (response: DOHResponse): InspectionResult => {
  return new InspectionResult(
    DomainInspectionType.DNSSec,
    // status should be 0 ("SUCCESS") and AD flag should be set ("Authenticated Data")
    response.Status === 0 && response.AD,
    {
      response,
    }
  );
};
