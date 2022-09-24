import { InspectionResult, OrganizationalInspectionType } from "../Inspector";

export const responsibleDisclosureChecker = async (
  response: Response
): Promise<InspectionResult> => {
  const textContent = await response.text();

  return new InspectionResult(
    OrganizationalInspectionType.ResponsibleDisclosure,
    textContent.includes("Contact") && textContent.includes("Expires"),
    {
      "security.txt": textContent,
    }
  );
};
