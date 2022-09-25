import {
  InspectionResult,
  OrganizationalInspectionType,
  Inspector,
} from "../Inspector";
import { responsibleDisclosureChecker } from "./responsibleDisclosureChecker";

export default class OrganizationalInspector
  implements Inspector<OrganizationalInspectionType>
{
  constructor(protected readonly httpClient: typeof fetch) {}
  async inspect(
    fqdn: string
  ): Promise<{ [key in OrganizationalInspectionType]: InspectionResult }> {
    const response = await this.httpClient(
      new URL(`https://${fqdn}/.well-known/security.txt`).toString()
    );

    return {
      [OrganizationalInspectionType.ResponsibleDisclosure]:
        await responsibleDisclosureChecker(response),
    };
  }
}
