import { HeaderInspectionType, InspectionResult } from "../Inspector";

export const hstsChecker = (response: Response) => {
  return new InspectionResult(
    HeaderInspectionType.HSTS,
    response.headers.get("Strict-Transport-Security") !== null,
    {
      "Strict-Transport-Security": response.headers.get(
        "Strict-Transport-Security"
      ),
    }
  );
};
