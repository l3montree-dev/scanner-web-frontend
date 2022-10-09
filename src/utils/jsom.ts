import { JSDOM } from "jsdom";

export const getJSDOM =
  (httpClient: typeof fetch) =>
  async (fqdn: string): Promise<JSDOM> => {
    const url = new URL(`https://${fqdn}`);
    const response = await httpClient(url.toString(), {
      method: "GET",
    });
    return new JSDOM(await response.text());
  };
