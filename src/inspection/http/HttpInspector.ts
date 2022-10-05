import { buildInspectionError } from "../../utils/error";
import { getLogger } from "../../services/logger";

import { HttpInspectionType, InspectionResult, Inspector } from "../Inspector";
import { redirectChecker } from "./redirectChecker";

const logger = getLogger(__filename);
export default class HttpInspector implements Inspector<HttpInspectionType> {
  constructor(private readonly httpClient: typeof fetch) {}
  async inspect(
    fqdn: string
  ): Promise<{ [type in HttpInspectionType]: InspectionResult }> {
    try {
      // use http as protocol.
      const url = new URL(`http://${fqdn}`);
      const httpResponse = await this.httpClient(url.toString(), {
        method: "GET",
        redirect: "manual",
      });

      return {
        HTTP: new InspectionResult(
          HttpInspectionType.HTTP,
          httpResponse.status <= 500,
          {
            response: await httpResponse.text(),
          }
        ),
        HTTP308: new InspectionResult(
          HttpInspectionType.HTTP308,
          httpResponse.status === 308,
          {
            status: httpResponse.status,
          }
        ),
        HTTPRedirectsToHttps: redirectChecker(httpResponse),
      };
    } catch (e: unknown) {
      logger.error(e, `http inspection for ${fqdn} failed`);
      return buildInspectionError(HttpInspectionType, e);
    }
  }
}
