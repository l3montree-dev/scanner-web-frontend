import { HttpInspectionType, InspectionResult, Inspector } from "../Inspector";

export default class HttpInspector implements Inspector<HttpInspectionType> {
  constructor(private readonly httpClient: typeof fetch) {}
  async inspect(
    hostname: string
  ): Promise<{ [type in HttpInspectionType]: InspectionResult }> {
    // use http as protocol.
    const url = new URL(`http://${hostname}`);
    const response = await this.httpClient(url.toString(), {
      method: "GET",
      redirect: "manual",
    });

    throw new Error("Method not implemented.");
  }
}
