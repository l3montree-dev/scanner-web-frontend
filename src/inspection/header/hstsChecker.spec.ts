import TestHeaderResponse from "../../test-utils/TestHeaderResponse";
import {
  hstsChecker,
  HSTSRecommendation,
  HSTSValidationError,
} from "./hstsChecker";

describe("HSTS Checker Test suite", () => {
  it("REQUIRED: the 'Strict-Transport-Security' response header is present", () => {
    const result = hstsChecker({ headers: new TestHeaderResponse({}) } as any);
    expect(result.didPass).toBe(false);
    expect(result.errors).toEqual([
      HSTSValidationError.MissingHeader,
      HSTSValidationError.MissingMaxAge,
    ]);
  });
  it("REQUIRED: the 'max-age=<expire-time>' directive is present", () => {
    const result = hstsChecker({
      headers: new TestHeaderResponse({
        "strict-transport-security": "includeSubDomains",
      }),
    } as any);
    expect(result.didPass).toBe(false);
    expect(result.errors).toEqual([HSTSValidationError.MissingMaxAge]);
  });
  it("RECOMMENDED: the 'includeSubDomains' directive SHOULD be present", () => {
    const result = hstsChecker({
      headers: new TestHeaderResponse({
        "strict-transport-security": "max-age=31536000",
      }),
    } as any);
    expect(result.didPass).toBe(true);
    expect(result.recommendations).toEqual([
      HSTSRecommendation.MissingIncludeSubDomains,
    ]);
  });
});
