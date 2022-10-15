import TestBodyResponse from "../../test-utils/TestBodyResponse";
import {
  responsibleDisclosureChecker,
  ResponsibleDisclosureRecommendation,
  ResponsibleDisclosureValidationError,
} from "./responsibleDisclosureChecker";

describe("Responsible disclosure test suite", () => {
  it("REQUIRED: the file '/.well-known/security.txt' is present.", async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse("", 404) as any
    );
    expect(didPass).toBe(false);
    expect(errors).toContain(
      ResponsibleDisclosureValidationError.MissingResponsibleDisclosure
    );
  });
  it(`should succeed, if Contact: is included twice`, async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse(`Contact:\nContact::`) as any
    );
    expect(didPass).toBe(false);
    expect(errors).not.toContain(
      ResponsibleDisclosureValidationError.MissingContactField
    );
  });
  it(`should fail, if Contact: is not included`, async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse("") as any
    );
    expect(didPass).toBe(false);
    expect(errors).toContain(
      ResponsibleDisclosureValidationError.MissingContactField
    );
  });
  it(`should succeed, if Contact: is included once`, async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse("Contact:") as any
    );
    expect(didPass).toBe(false);
    expect(errors).not.toContain(
      ResponsibleDisclosureValidationError.MissingContactField
    );
  });

  it(`should fail, if Expires: is included twice`, async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse(`Expires:\nExpires:`) as any
    );
    expect(didPass).toBe(false);
    expect(errors).toContain(
      ResponsibleDisclosureValidationError.InvalidExpiresField
    );
  });
  it(`should fail, if Expires is not included`, async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse("") as any
    );
    expect(didPass).toBe(false);
    expect(errors).toContain(
      ResponsibleDisclosureValidationError.InvalidExpiresField
    );
  });
  it(`should succeed, if Expires is included once`, async () => {
    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse("Expires:") as any
    );
    expect(didPass).toBe(false);
    expect(errors).not.toContain(
      ResponsibleDisclosureValidationError.InvalidExpiresField
    );
  });
  it("should fail, if the security.txt did expire", async () => {
    // expired by around 16 minutes
    const date = new Date(Date.now() - 1_000_000);

    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse(`Expires:${date.toISOString()}`) as any
    );
    expect(didPass).toBe(false);
    expect(errors).toContain(ResponsibleDisclosureValidationError.Expired);
  });
  it("should succeed, if the expires date is in the future", async () => {
    // expires in around 16 minutes
    const date = new Date(Date.now() + 1_000_000);

    const { didPass, errors } = await responsibleDisclosureChecker(
      new TestBodyResponse(`Expires:${date.toISOString()}`) as any
    );

    expect(errors).not.toContain(ResponsibleDisclosureValidationError.Expired);
  });

  describe.each([
    {
      key: "Encryption:",
      error: ResponsibleDisclosureRecommendation.InvalidEncryption,
    },
    {
      key: "Canonical:",
      error: ResponsibleDisclosureRecommendation.InvalidCanonical,
    },
    {
      key: "Preferred-Languages:",
      error: ResponsibleDisclosureRecommendation.InvalidPreferredLanguages,
    },
  ])(
    "RECOMMENDED: the file '/.well-known/security.txt' contains one or more %s fields.",
    ({ key, error }) => {
      it(`should fail, if ${key}: is included twice`, async () => {
        const { recommendations } = await responsibleDisclosureChecker(
          new TestBodyResponse(`${key}:\n${key}:`) as any
        );
        expect(recommendations).toContain(error);
      });
      it(`should fail, if ${key} is not included`, async () => {
        const { recommendations } = await responsibleDisclosureChecker(
          new TestBodyResponse("") as any
        );
        expect(recommendations).toContain(error);
      });
      it(`should succeed, if ${key} is included once`, async () => {
        const { recommendations } = await responsibleDisclosureChecker(
          new TestBodyResponse(key) as any
        );
        expect(recommendations).not.toContain(error);
      });
    }
  );
  describe('RECOMMENDED: the file "/.well-known/security.txt" is signed with a valid PGP signature. https://datatracker.ietf.org/doc/html/draft-foudil-securitytxt-12#section-3.3', () => {
    it("should fail, if the file is not signed", async () => {
      const { recommendations } = await responsibleDisclosureChecker(
        new TestBodyResponse("") as any
      );
      expect(recommendations).toContain(
        ResponsibleDisclosureRecommendation.MissingPGPSignature
      );
    });
    it("should succeed, if the file is signed", async () => {
      const { recommendations } = await responsibleDisclosureChecker(
        new TestBodyResponse("--------BEGIN PGP SIGNATURE--------") as any
      );
      expect(recommendations).not.toContain(
        ResponsibleDisclosureRecommendation.MissingPGPSignature
      );
    });
  });
});
