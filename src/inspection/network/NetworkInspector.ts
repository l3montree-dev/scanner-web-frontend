import {
  InspectionResult,
  NetworkInspectionType,
  Inspector,
} from "../Inspector";

export default class NetworkInspector
  implements Inspector<NetworkInspectionType>
{
  constructor(private dns: { resolve6: (fqdn: string) => Promise<string[]> }) {}

  async inspect(
    fqdn: string
  ): Promise<{ [key in NetworkInspectionType]: InspectionResult }> {
    const addresses = await this.dns.resolve6(fqdn);
    return {
      [NetworkInspectionType.IPv6]: new InspectionResult(
        NetworkInspectionType.IPv6,
        addresses.length > 0,
        {
          addresses,
        }
      ),
    };
  }
}
