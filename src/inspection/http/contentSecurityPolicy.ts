import { HttpInspectionType, InspectionResult } from "../Inspector";

export const contentSecurityPolicyCheck = (
  response: Response
): InspectionResult => {
  const header = response.headers.get("Content-Security-Policy");
  // TODO: A meta tag might exist as well inside the body.

  return new InspectionResult(
    HttpInspectionType.ContentSecurityPolicy,
    // when should this check pass.
    !!header,
    {
      "Content-Security-Policy": header,
    }
  );
};
