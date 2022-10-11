import { JSDOM } from "jsdom";
import { HttpClient } from "../services/httpClient";

export const getJSDOM =
  (httpClient: HttpClient) =>
  async (requestId: string, fqdn: string): Promise<JSDOM> => {
    const url = new URL(`https://${fqdn}`);
    const response = await httpClient(url.toString(), requestId, {
      method: "GET",
    });
    return new JSDOM(await response.text());
  };
