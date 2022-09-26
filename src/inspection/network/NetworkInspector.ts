import { logger } from "../../utils/logger";
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
    let addresses: string[];
    try {
      addresses = await this.dns.resolve6(fqdn);
    } catch (e) {
      logger.error({ err: e }, `failed to resolve ${fqdn} to IPv6 addresses`);
      addresses = [];
    }

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
