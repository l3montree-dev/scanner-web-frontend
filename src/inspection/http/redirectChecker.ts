import { HttpInspectionType, InspectionResult } from "../Inspector";

export const redirectChecker = (httpResponse: Response): InspectionResult => {
  const locationHeader = httpResponse.headers.get("Location");

  return new InspectionResult(
    HttpInspectionType.HTTPRedirectsToHttps,
    !!locationHeader?.startsWith("https"),
    {
      Location: locationHeader,
    }
  );
};
