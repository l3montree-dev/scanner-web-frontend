import {
  ContentInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";

import { JSDOM } from "jsdom";
import { buildInspectionError } from "../../utils/error";
import { noMixedContentChecker } from "./noMixedContentChecker";

import { getLogger } from "../../services/logger";
import { subResourceIntegrityChecker } from "./subResourceIntegrityChecker";

const logger = getLogger(__filename);
export default class ContentInspector
  implements Inspector<ContentInspectionType, JSDOM>
{
  constructor() {}
  async inspect(
    dom: JSDOM
  ): Promise<{ [key in ContentInspectionType]: InspectionResult }> {
    try {
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
