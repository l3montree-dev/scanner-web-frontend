import { InspectionResult, OrganizationalInspectionType } from "../Inspector";

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
