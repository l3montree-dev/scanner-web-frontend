import { validationHelper } from "../../utils/validationHelper";
import { HeaderInspectionType, InspectionResult } from "../Inspector";

export enum HSTSValidationError {
  MissingHeader = "MissingHeader",
  MissingMaxAge = "MissingMaxAge",
}

export enum HSTSRecommendation {
  MissingIncludeSubDomains = "MissingIncludeSubDomains",
}
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
  const { didPass, errors, recommendations } = validationHelper(
    {
      [HSTSValidationError.MissingHeader]: () =>
        response.headers.has("Strict-Transport-Security"),
      [HSTSValidationError.MissingMaxAge]: () =>
        response.headers
          .get("Strict-Transport-Security")
          ?.includes("max-age=") || false,
    },
    {
      [HSTSRecommendation.MissingIncludeSubDomains]: () =>
        response.headers
          .get("Strict-Transport-Security")
          ?.includes("includeSubDomains") || false,
    }
  );

  return new InspectionResult(
    HeaderInspectionType.HSTS,
    didPass,
    {
      "Strict-Transport-Security": response.headers.get(
        "Strict-Transport-Security"
      ),
    },
    errors,
    recommendations
  );
};
