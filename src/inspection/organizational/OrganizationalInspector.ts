import { buildInspectionError } from "../../utils/error";
import { logger } from "../../utils/logger";
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
    try {
      const response = await this.httpClient(
        new URL(`https://${fqdn}/.well-known/security.txt`).toString()
      );

      return {
        [OrganizationalInspectionType.ResponsibleDisclosure]:
          await responsibleDisclosureChecker(response),
      };
    } catch (e) {
      logger.error({ err: e }, `organizational inspection for ${fqdn} failed`);
      return buildInspectionError(OrganizationalInspectionType, e);
    }
  }
}
