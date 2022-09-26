import { InspectionResult, TLSInspectionType, Inspector } from "../Inspector";

export default class TLSInspector implements Inspector<TLSInspectionType> {
  inspect(
    fqdn: string
  ): Promise<{ [key in TLSInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
