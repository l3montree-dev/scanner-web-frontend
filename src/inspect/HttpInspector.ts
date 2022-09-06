import { InspectionType, InspectResult, UrlInspector } from "./Inspector";

export default class HttpInspect extends UrlInspector {
  async inspect(hostname: string): Promise<InspectResult[]> {
    // use http as protocol.
    const url = new URL(`http://${hostname}`);
    const response = await this.httpClient(url.toString(), {
      method: "GET",
      redirect: "manual",
    });

    const headers = response.headers;
    const location = headers.get("location");

    return [
      new InspectResult(InspectionType.HTTP, undefined, [
        new InspectResult(InspectionType.HTTP_308, response.status === 308),
        new InspectResult(
          InspectionType.HTTP_LocationHttps,
          Boolean(location?.startsWith("https://"))
        ),
      ]),
    ];
  }
}
