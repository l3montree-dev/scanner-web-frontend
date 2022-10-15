import { getLogger } from "../../services/logger";
import { buildInspectionError } from "../../utils/error";

import { ServerHttpClient } from "../../services/serverHttpClient";
import { HttpInspectionType, InspectionResult, Inspector } from "../Inspector";
import { redirectChecker } from "./redirectChecker";

const logger = getLogger(__filename);
export default class HttpInspector
  implements
    Inspector<
      HttpInspectionType,
      { fqdn: string; httpClient: ServerHttpClient }
    >
{
  async inspect(
    requestId: string,
    { fqdn, httpClient }: { fqdn: string; httpClient: ServerHttpClient }
  ): Promise<{ [type in HttpInspectionType]: InspectionResult }> {
    try {
      // use http as protocol.
      const url = new URL(`http://${fqdn}`);
      const httpResponse = await httpClient(
        url.toString(),
        requestId,
        {
          method: "GET",
        },
        {
          maxRetries: 0,
        }
      );

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
      logger.error({ err: e, requestId }, `http inspection for ${fqdn} failed`);
      return buildInspectionError(HttpInspectionType, e);
    }
  }
}
