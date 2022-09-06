import { InspectResult, ResponseInspector, UrlInspector } from "./Inspector";

export default class DefaultUrlInspector implements UrlInspector {
  constructor(private readonly responseInspectors: ResponseInspector[]) {}
  async inspect(url: URL): Promise<InspectResult[]> {
    const response = await fetch(url.toString(), {
      method: "GET",
    });

    return await Promise.all(
      this.responseInspectors.map((responseInspector) =>
        responseInspector.inspect(response)
      )
    );
  }
}
