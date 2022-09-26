import { buildInspectionError, errorMessage } from "../../utils/error";
import { getLogger } from "../../utils/logger";

import {
  HeaderInspectionType,
  HttpInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import { contentSecurityPolicyCheck } from "../header/contentSecurityPolicy";
import { contentTypeOptionsChecker } from "./contentTypeOptionsChecker";
import { xFrameOptionsChecker } from "./xframeOptionsChecker";
import { xssProtectionChecker } from "./xssProtectionChecker";

const logger = getLogger(__filename);
export default class HeaderInspector
  implements Inspector<HeaderInspectionType>
{
  constructor(private readonly httpClient: typeof fetch) {}
  async inspect(
    fqdn: string
  ): Promise<{ [type in HeaderInspectionType]: InspectionResult }> {
    try {
      // use http as protocol.
      const url = new URL(`https://${fqdn}`);
      const httpsResponse = await this.httpClient(url.toString(), {
        method: "GET",
      });

      return {
        ContentSecurityPolicy: contentSecurityPolicyCheck(httpsResponse),
        XFrameOptions: xFrameOptionsChecker(httpsResponse),
        XSSProtection: xssProtectionChecker(httpsResponse),
        ContentTypeOptions: contentTypeOptionsChecker(httpsResponse),
      };
    } catch (e: unknown) {
      logger.error(e, `header inspection for ${fqdn} failed`);
      return buildInspectionError(HeaderInspectionType, e);
    }
  }
}
