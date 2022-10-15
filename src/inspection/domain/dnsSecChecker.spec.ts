import { dnsSecChecker } from "./dnsSecChecker";
import { DOHResponse } from "./dohResponse";
import dnsSecValidExampleResponse from "./fixtures/dnsSecValidExampleResponse.json";

describe("DNSSec Checker Test suite", () => {
  let exampleResponse: DOHResponse;
  beforeEach(() => {
    exampleResponse = { ...dnsSecValidExampleResponse } as DOHResponse;
  });

  describe('REQUIRED: "AD" MUST be set to "true".', () => {
    it("should fail if false", () => {
      exampleResponse.AD = false;
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should succeed if true", () => {
      exampleResponse.AD = true;
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
  describe('REQUIRED: "Status" MUST be set to "0"', () => {
    it("should fail if not 0", () => {
      exampleResponse.Status = 1;
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should succeed, if 0", () => {
      exampleResponse.Status = 0;
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
  describe('REQUIRED: "CD" MUST be set to "false".', () => {
    it("should fail if true", () => {
      exampleResponse.CD = true;
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should succeed if false", () => {
      exampleResponse.CD = false;
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
  describe('REQUIRED: the "type": 46, RRSIG record MUST be present.', () => {
    it("should fail if missing", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type !== 46
      );
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should succeed, if present", () => {
      const result = dnsSecChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
});
