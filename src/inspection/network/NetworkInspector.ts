import {
  InspectionResult,
  NetworkInspectionType,
  Inspector,
} from "../Inspector";

export default class NetworkInspector
  implements Inspector<NetworkInspectionType>
{
  inspect(
    fqdn: string
  ): Promise<{ [key in NetworkInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
