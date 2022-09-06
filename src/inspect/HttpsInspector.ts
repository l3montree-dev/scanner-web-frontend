import { InspectionType, InspectResult, UrlInspector } from "./Inspector";

export default class HttpsInspect extends UrlInspector {
  async inspect(hostname: string): Promise<InspectResult[]> {
    // use http as protocol.
    const url = new URL(`https://${hostname}`);
    const response = await this.httpClient(url.toString(), {
      method: "GET",
      redirect: "manual",
    });

    return [new InspectResult(InspectionType.HTTPS, response.ok)];
  }
}
