import { HttpInspectionType, InspectionResult } from "../Inspector";

export const contentSecurityPolicyCheck = (
  response: Response
): InspectionResult => {
  const header = response.headers.get("Content-Security-Policy");
  return new InspectionResult(
    HttpInspectionType.ContentSecurityPolicy,
    // when should this check pass.
    true,
    {
      "Content-Security-Policy": header,
    }
  );
};
