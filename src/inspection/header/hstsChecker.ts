import { HeaderInspectionType, InspectionResult } from "../Inspector";

/**
 *
 * @requirements
 * REQUIRED: the "Strict-Transport-Security" response header is present.
 * REQUIRED: the "max-age=<expire-time>" directive is present.
 * RECOMMENDED: the "includeSubDomains" directive SHOULD be present.
 *
 * Example: Strict-Transport-Security: max-age=31536000; includeSubDomains
 *
 */
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
