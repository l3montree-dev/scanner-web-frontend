import { JSDOM } from "jsdom";

export const getJSDOM = async (response: Response): Promise<JSDOM> => {
  return new JSDOM(await response.text());
};
