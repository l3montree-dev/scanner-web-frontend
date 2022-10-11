import { getLogger } from "../../services/logger";
import { buildInspectionError } from "../../utils/error";

import { HttpClient } from "../../services/httpClient";
import {
  HeaderInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import { contentSecurityPolicyCheck } from "./contentSecurityPolicy";
import { contentTypeOptionsChecker } from "./contentTypeOptionsChecker";
import { hstsChecker } from "./hstsChecker";
import { hstsPreloadedChecker } from "./hstsPreloadedChecker";
import { xFrameOptionsChecker } from "./xframeOptionsChecker";
import { xssProtectionChecker } from "./xssProtectionChecker";

const logger = getLogger(__filename);
export default class HeaderInspector
  implements Inspector<HeaderInspectionType>
{
  constructor(private readonly httpClient: HttpClient) {}
  async inspect(
    requestId: string,
    fqdn: string
  ): Promise<{ [type in HeaderInspectionType]: InspectionResult }> {
    try {
      // use http as protocol.
      const url = new URL(`https://${fqdn}`);
      const httpsResponse = await this.httpClient(url.toString(), requestId, {
        method: "GET",
      });

      return {
        HTTPS: new InspectionResult(
          HeaderInspectionType.HTTPS,
          httpsResponse.ok,
          {}
        ),
        HSTS: hstsChecker(httpsResponse),
        HSTSPreloaded: hstsPreloadedChecker(httpsResponse),
        ContentSecurityPolicy: contentSecurityPolicyCheck(httpsResponse),
        XFrameOptions: xFrameOptionsChecker(httpsResponse),
        XSSProtection: xssProtectionChecker(httpsResponse),
        ContentTypeOptions: contentTypeOptionsChecker(httpsResponse),
      };
    } catch (e: unknown) {
      logger.error(
        { err: e, requestId },
        `header inspection for ${fqdn} failed`
      );
      return buildInspectionError(HeaderInspectionType, e);
    }
  }
}
