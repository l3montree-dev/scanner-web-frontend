import { HttpInspectionType, InspectionResult, Inspector } from "../Inspector";
import { contentSecurityPolicyCheck } from "./contentSecurityPolicy";
import { contentTypeOptionsChecker } from "./contentTypeOptionsChecker";
import { redirectChecker } from "./redirectChecker";
import { xFrameOptionsChecker } from "./xframeOptionsChecker";
import { xssProtectionChecker } from "./xssProtectionChecker";

export default class HttpInspector implements Inspector<HttpInspectionType> {
  constructor(private readonly httpClient: typeof fetch) {}
  async inspect(
    hostname: string
  ): Promise<{ [type in HttpInspectionType]: InspectionResult }> {
    // use http as protocol.
    const url = new URL(`http://${hostname}`);
    const httpsUrl = new URL("https://" + hostname);
    const [httpResponse, httpsResponse] = await Promise.all([
      this.httpClient(url.toString(), {
        method: "GET",
        redirect: "manual",
      }),
      this.httpClient(httpsUrl.toString(), {
        method: "GET",
      }),
    ]);

    return {
      HTTP: new InspectionResult(HttpInspectionType.HTTP, httpResponse.ok, {}),
      HTTP308: new InspectionResult(
        HttpInspectionType.HTTP308,
        httpResponse.status === 308,
        {
          status: httpResponse.status,
        }
      ),
      HTTPRedirectsToHttps: redirectChecker(httpsResponse),
      ContentSecurityPolicy: contentSecurityPolicyCheck(httpsResponse),
      XFrameOptions: xFrameOptionsChecker(httpsResponse),
      XSSProtection: xssProtectionChecker(httpsResponse),
      ContentTypeOptions: contentTypeOptionsChecker(httpsResponse),
    };
  }
}
