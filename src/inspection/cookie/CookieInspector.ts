import {
  CookieInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";

export default class CookieInspector
  implements Inspector<CookieInspectionType>
{
  inspect(
    hostname: string
  ): Promise<{ [key in CookieInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
