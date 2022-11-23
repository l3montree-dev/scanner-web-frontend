import { buildInspectionError } from "../../utils/error";
import { getLogger } from "../../services/logger";
import {
  InspectionResult,
  OrganizationalInspectionType,
  Inspector,
} from "../Inspector";
import { responsibleDisclosureChecker } from "./responsibleDisclosureChecker";
import { HttpClient } from "../../services/clientHttpClient";

const logger = getLogger(__filename);
export default class OrganizationalInspector
  implements
    Inspector<
      OrganizationalInspectionType,
      { fqdn: string; httpClient: HttpClient }
    >
{
  async inspect(
    requestId: string,
    { fqdn, httpClient }: { fqdn: string; httpClient: HttpClient }
  ): Promise<{ [key in OrganizationalInspectionType]: InspectionResult }> {
    try {
      const response = await httpClient(
        new URL(`http://${fqdn}/.well-known/security.txt`).toString(),
        requestId
      );

      return {
        [OrganizationalInspectionType.ResponsibleDisclosure]:
          await responsibleDisclosureChecker(response),
      };
    } catch (e) {
      logger.error(
        { err: e, requestId },
        `organizational inspection for ${fqdn} failed`
      );
      return buildInspectionError(OrganizationalInspectionType, e);
    }
  }
}
