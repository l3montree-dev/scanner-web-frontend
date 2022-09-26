import {
  HeaderInspectionType,
  HttpInspectionType,
  InspectionResult,
} from "../Inspector";

export const contentTypeOptionsChecker = (
  response: Response
): InspectionResult => {
  const header = response.headers.get("X-Content-Type-Options");
  return new InspectionResult(
    HeaderInspectionType.ContentTypeOptions,
    header === "nosniff",
    {
      "X-Content-Type-Options": header,
    }
  );
};
