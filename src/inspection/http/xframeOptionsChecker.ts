import { HttpInspectionType, InspectionResult } from "../Inspector";

export const xFrameOptionsChecker = (response: Response): InspectionResult => {
  const xFrameOptions = response.headers.get("X-Frame-Options");
  return new InspectionResult(
    HttpInspectionType.XFrameOptions,
    xFrameOptions === "SAMEORIGIN" || xFrameOptions === "DENY",
    { "X-Frame-Options": xFrameOptions }
  );
};
