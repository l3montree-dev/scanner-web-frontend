import { DomainInspectionType, InspectionResult } from "../Inspector";
import { DOHResponse } from "./dohResponse";

export const caaChecker = (response: DOHResponse): InspectionResult => {
  return new InspectionResult(
    DomainInspectionType.CAA,
    // status should be 0 ("SUCCESS") and AD flag should be set ("Authenticated Data")
    response.Status === 0 &&
      response.Answer.some((answer) => answer.type === 257),
    {
      Answer: response.Answer,
    }
  );
};
