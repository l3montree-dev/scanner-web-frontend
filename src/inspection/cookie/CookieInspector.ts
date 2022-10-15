import { getLogger } from "../../services/logger";
import { buildInspectionError } from "../../utils/error";
import {
  CookieInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import { SecureSessionCookiesChecker } from "./secureSessionCookieChecker";

const logger = getLogger(__filename);
export default class CookieInspector
  implements Inspector<CookieInspectionType, Response>
{
  async inspect(
    requestId: string,
    httpsResponse: Response
  ): Promise<{ [key in CookieInspectionType]: InspectionResult }> {
    try {
      return {
        SecureSessionCookies: SecureSessionCookiesChecker(httpsResponse),
      };
    } catch (e: unknown) {
      logger.error({ err: e, requestId }, `header inspection failed`);
      return buildInspectionError(CookieInspectionType, e);
    }
  }
}
