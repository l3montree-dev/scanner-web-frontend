import { caaChecker } from "./caaChecker";
import { DOHResponse } from "./dohResponse";
import dnsSecValidExampleResponse from "./fixtures/dnsSecValidExampleResponse.json";

describe("CAA checker test suite", () => {
  let exampleResponse: DOHResponse;
  beforeEach(() => {
    exampleResponse = { ...dnsSecValidExampleResponse } as DOHResponse;
  });
  describe('REQUIRED: The "CAA" records are present.', () => {
    it("should fail if missing", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type !== 257
      );
      const result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should success if present", () => {
      const result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
  describe('REQUIRED: The "CAA" flag is set to 0 (not critical).', () => {
    it("should fail if missing", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type === 257
      );
      exampleResponse.Answer![0].data = '1 issue "letsencrypt.org"';
      const result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should success if present", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type === 257
      );
      exampleResponse.Answer![0].data = '0 issue "letsencrypt.org"';
      const result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
  describe('REUQIRED: The "CAA" "issue" (value not ";") and/ or "issuewild" properties are present.', () => {
    it("should fail if missing", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type === 257
      );
      exampleResponse.Answer![0].data = '0 issue ";"';
      let result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(false);

      exampleResponse.Answer![0].data = '0 issuewild ";"';
      result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
    it("should success if present", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type === 257
      );
      exampleResponse.Answer![0].data = '0 issue "letsencrypt.org"';
      let result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(true);

      exampleResponse.Answer![0].data = '0 issuewild "letsencrypt.org"';
      result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(true);
    });
  });
  describe('REUQIRED: The "CAA" "iodef" property is present (mailto: or https://).', () => {
    it("should fail if missing", () => {
      exampleResponse.Answer = exampleResponse.Answer?.filter(
        (a) => a.type === 257 && !a.data.includes("iodef")
      );

      let result = caaChecker(exampleResponse);
      expect(result.didPass).toBe(false);
    });
  });
  describe.each([
    {
      value: [
        '0 issue "letsencrypt.org"',
        '0 iodef "mailto:opensource@neuland-homeland.de"',
      ],
      expected: true,
    },
    {
      value: [
        '0 issue "ca1.example.net; account=230123"',
        '0 iodef "mailto:opensource@neuland-homeland.de"',
      ],
      expected: true,
    },
    {
      value: [
        '0 issuewild "letsencrypt.org"',
        '0 iodef "mailto:opensource@neuland-homeland.de"',
      ],
      expected: true,
    },
    {
      value: ['0 issuewild "letsencrypt.org"', ""],
      expected: false,
    },
    {
      value: ['0 issue ";"', '0 iodef "mailto:opensource@neuland-homeland.de"'],
      expected: false,
    },
    {
      value: [
        '1 issue "letsencrypt.org"',
        '0 iodef "mailto:opensource@neuland-homeland.de"',
      ],
      expected: false,
    },
    /*{
      value: [
        '0 issue "%%%%%"',
        '0 iodef "mailto:opensource@neuland-homeland.de"',
      ],
      expected: false,
    },*/
  ])("snapshot testing", ({ value, expected }) => {
    it(`${value[0]}+${value[1]} expected:${expected}`, () => {
      expect(
        caaChecker({
          ...exampleResponse,
          Answer: [
            {
              type: 257,
              data: value[0],
              TTL: 1,
              name: "example.com",
            },
            {
              type: 257,
              data: value[1],
              TTL: 1,
              name: "example.com",
            },
          ],
        }).didPass
      ).toBe(expected);
    });
  });
});
