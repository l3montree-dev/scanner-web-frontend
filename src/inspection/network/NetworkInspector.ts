import {
  InspectionResult,
  NetworkInspectionType,
  Inspector,
} from "../Inspector";

export default class NetworkInspector
  implements Inspector<NetworkInspectionType>
{
  inspect(
    hostname: string
  ): Promise<{ [key in NetworkInspectionType]: InspectionResult }> {
    throw new Error("Method not implemented.");
  }
}
