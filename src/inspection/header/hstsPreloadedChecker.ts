import { HeaderInspectionType, InspectionResult } from "../Inspector";

export const hstsPreloadedChecker = (response: Response) => {
  const header = response.headers.get("Strict-Transport-Security");
  return new InspectionResult(
    HeaderInspectionType.HSTSPreloaded,
    header !== null && header.includes("preload"),
    {
      "Strict-Transport-Security": response.headers.get(
        "Strict-Transport-Security"
      ),
    }
  );
};
