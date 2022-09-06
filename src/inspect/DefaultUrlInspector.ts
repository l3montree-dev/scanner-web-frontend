import { InspectResult, ResponseInspector, UrlInspector } from "./Inspector";

export default class DefaultUrlInspector extends UrlInspector {
  constructor(
    private readonly responseInspectors: ResponseInspector[],
    httpClient: typeof fetch
  ) {
    super(httpClient);
  }
  async inspect(hostname: string): Promise<InspectResult[]> {
    // use https as protocol.
    const url = new URL(`https://${hostname}`);
    const response = await this.httpClient(url.toString(), {
      method: "GET",
    });

    return (
      await Promise.all(
        this.responseInspectors.map((responseInspector) =>
          responseInspector.inspect(response)
        )
      )
    ).flat();
  }
}
