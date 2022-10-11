import { buildInspectionError } from "../../utils/error";
import { getLogger } from "../../services/logger";
import {
  InspectionResult,
  OrganizationalInspectionType,
  Inspector,
} from "../Inspector";
import { responsibleDisclosureChecker } from "./responsibleDisclosureChecker";
import { HttpClient } from "../../services/httpClient";

const logger = getLogger(__filename);
export default class OrganizationalInspector
  implements Inspector<OrganizationalInspectionType>
{
  constructor(protected readonly httpClient: HttpClient) {}
  async inspect(
    fqdn: string
  ): Promise<{ [key in OrganizationalInspectionType]: InspectionResult }> {
    try {
      const response = await this.httpClient(
        new URL(`https://${fqdn}/.well-known/security.txt`).toString()
      );

      return {
        [OrganizationalInspectionType.ResponsibleDisclosure]:
          await responsibleDisclosureChecker(response),
      };
    } catch (e) {
      logger.error(e, `organizational inspection for ${fqdn} failed`);
      return buildInspectionError(OrganizationalInspectionType, e);
    }
  }
}
