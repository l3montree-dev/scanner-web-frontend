import { InspectionResult, OrganizationalInspectionType } from "../Inspector";

/**
 *
 * @requirements
 * REQUIRED: the file "/.well-known/security.txt" is present.
 * REQUIRED: the file "/.well-known/security.txt" contains one or more "Contact:" fields.
 * REQUIRED: the file "/.well-known/security.txt" contains the "Expires:" field ONCE.
 * RECCOMENDED: the file "/.well-known/security.txt" contains the "Encryption:" field, if so only ONCE.
 * RECCOMENDED: the file "/.well-known/security.txt" contains the "Canonical:" field, if so only ONCE.
 * RECCOMENDED: the file "/.well-known/security.txt" contains the "Preferred-Languages:" field, if so only ONCE.
 * RECCOMENDED: the file "/.well-known/security.txt" is signed with a valid PGP signature. https://datatracker.ietf.org/doc/html/draft-foudil-securitytxt-12#section-3.3
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

  return new InspectionResult(
    OrganizationalInspectionType.ResponsibleDisclosure,
    response.status !== 404 &&
      textContent.includes("Contact") &&
      textContent.includes("Expires"),
    {
      "security.txt": response.status === 404 ? "404" : textContent,
    }
  );
};
