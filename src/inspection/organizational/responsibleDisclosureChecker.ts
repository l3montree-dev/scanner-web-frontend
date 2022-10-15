import { includesOnce, validationHelper } from "../../utils/validationHelper";
import { InspectionResult, OrganizationalInspectionType } from "../Inspector";

export enum ResponsibleDisclosureValidationError {
  MissingResponsibleDisclosure = "MissingResponsibleDisclosure",
  MissingContactField = "MissingContactField",
  InvalidExpiresField = "InvalidExpiresField",
  Expired = "Expired",
}

// invalid means either missing or twice included
export enum ResponsibleDisclosureRecommendation {
  InvalidEncryption = "InvalidEncryption",
  InvalidCanonical = "InvalidCanonical",
  InvalidPreferredLanguages = "InvalidPreferredLanguages",
  MissingPGPSignature = "MissingPGPSignature",
}

/**
 *
 * @requirements
 * REQUIRED: the file "/.well-known/security.txt" is present.
 * REQUIRED: the file "/.well-known/security.txt" contains one or more "Contact:" fields.
 * REQUIRED: the file "/.well-known/security.txt" contains the "Expires:" field ONCE.
 * RECOMMENDED: the file "/.well-known/security.txt" contains the "Encryption:" field, if so only ONCE.
 * RECOMMENDED: the file "/.well-known/security.txt" contains the "Canonical:" field, if so only ONCE.
 * RECOMMENDED: the file "/.well-known/security.txt" contains the "Preferred-Languages:" field, if so only ONCE.
 * RECOMMENDED: the file "/.well-known/security.txt" is signed with a valid PGP signature. https://datatracker.ietf.org/doc/html/draft-foudil-securitytxt-12#section-3.3
 *
 * Example: "Contact: mailto:..."
 * Example: "Contact: tel:.."
 * Example: "Contact: https://..."
 * Example: "Expires: 2021-12-31T18:37:07z"
 *
 */
export const responsibleDisclosureChecker = async (
  response: Response
): Promise<InspectionResult> => {
  const textContent = await response.text();

  const { didPass, errors, recommendations } = validationHelper(
    {
      [ResponsibleDisclosureValidationError.MissingResponsibleDisclosure]: () =>
        response.status < 300,
      [ResponsibleDisclosureValidationError.MissingContactField]: () =>
        textContent.includes("Contact:"),
      [ResponsibleDisclosureValidationError.InvalidExpiresField]: () =>
        includesOnce(textContent, "Expires:"),
      [ResponsibleDisclosureValidationError.Expired]: () => {
        const expires = textContent.split("Expires:")[1];
        if (expires) {
          const date = new Date(expires.trim());
          return date > new Date();
        }
        return false;
      },
    },
    {
      [ResponsibleDisclosureRecommendation.InvalidEncryption]: () =>
        includesOnce(textContent, "Encryption:"),
      [ResponsibleDisclosureRecommendation.InvalidCanonical]: () =>
        includesOnce(textContent, "Canonical:"),
      [ResponsibleDisclosureRecommendation.InvalidPreferredLanguages]: () =>
        includesOnce(textContent, "Preferred-Languages:"),
      [ResponsibleDisclosureRecommendation.MissingPGPSignature]: () =>
        textContent.includes("BEGIN PGP SIGNATURE"),
    }
  );

  return new InspectionResult(
    OrganizationalInspectionType.ResponsibleDisclosure,
    didPass,
    {
      "security.txt": response.status === 404 ? "404" : textContent,
    },
    errors,
    recommendations
  );
};
