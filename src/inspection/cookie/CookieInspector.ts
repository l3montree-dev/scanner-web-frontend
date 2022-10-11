import { buildInspectionError } from "../../utils/error";
import { getLogger } from "../../services/logger";
import {
  CookieInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import { SecureSessionCookiesChecker } from "./secureSessionCookieChecker";
import { HttpClient } from "../../services/httpClient";

const logger = getLogger(__filename);
export default class CookieInspector
  implements Inspector<CookieInspectionType>
{
  constructor(private readonly httpClient: HttpClient) {}
  async inspect(
    requestId: string,
    fqdn: string
  ): Promise<{ [key in CookieInspectionType]: InspectionResult }> {
    try {
      // use http as protocol.
      const url = new URL(`https://${fqdn}`);
      const httpsResponse = await this.httpClient(url.toString(), requestId, {
        method: "GET",
      });

      return {
        SecureSessionCookies: SecureSessionCookiesChecker(httpsResponse),
      };
    } catch (e: unknown) {
      logger.error(
        { err: e, requestId },
        `header inspection for ${fqdn} failed`
      );
      return buildInspectionError(CookieInspectionType, e);
    }
  }
}
