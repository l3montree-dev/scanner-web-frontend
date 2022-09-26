import {
  ContentInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";

import { JSDOM } from "jsdom";
import { buildInspectionError } from "../../utils/error";
import { noMixedContentChecker } from "./noMixedContentChecker";

import { getLogger } from "../../utils/logger";
import { subResourceIntegrityChecker } from "./subResourceIntegrityChecker";

const logger = getLogger(__filename);
export default class ContentInspector
  implements Inspector<ContentInspectionType>
{
  constructor(private readonly httpClient: typeof fetch) {}
  async inspect(
    fqdn: string
  ): Promise<{ [key in ContentInspectionType]: InspectionResult }> {
    try {
      const url = new URL(`https://${fqdn}`);
      const response = await this.httpClient(url.toString(), {
        method: "GET",
      });
      const dom = new JSDOM(await response.text());
      return {
        [ContentInspectionType.NoMixedContent]: noMixedContentChecker(dom),
        [ContentInspectionType.SubResourceIntegrity]:
          subResourceIntegrityChecker(dom),
      };
    } catch (e) {
      // handle error
      logger.error(e, "error while inspecting content");
      return buildInspectionError(ContentInspectionType, e);
    }
  }
}
