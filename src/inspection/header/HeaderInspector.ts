import { getLogger } from "../../services/logger";
import { buildInspectionError } from "../../utils/error";

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
  implements Inspector<HeaderInspectionType, Response>
{
  async inspect(
    requestId: string,
    httpsResponse: Response
  ): Promise<{ [type in HeaderInspectionType]: InspectionResult }> {
    try {
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
      logger.error({ err: e, requestId }, `header inspection failed`);
      return buildInspectionError(HeaderInspectionType, e);
    }
  }
}
