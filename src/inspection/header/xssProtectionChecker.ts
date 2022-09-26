import {
  HeaderInspectionType,
  HttpInspectionType,
  InspectionResult,
} from "../Inspector";

export const xssProtectionChecker = (response: Response): InspectionResult => {
  const xssProtection = response.headers.get("X-XSS-Protection");
  return new InspectionResult(
    HeaderInspectionType.XSSProtection,
    xssProtection === "1; mode=block",
    {
      "X-XSS-Protection": xssProtection,
    }
  );
};
