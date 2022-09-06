import { UrlInspector, InspectResult } from "./Inspector";

export class UrlInspectorGroup implements UrlInspector {
  constructor(private readonly urlInspectors: UrlInspector[]) {}

  async inspect(url: URL): Promise<Array<InspectResult>> {
    return await Promise.all(
      this.urlInspectors.map((urlInspector) => urlInspector.inspect(url))
    );
  }
}
