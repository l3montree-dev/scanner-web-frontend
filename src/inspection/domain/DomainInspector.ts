import {
  DomainInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import { caaChecker } from "./caaChecker";
import { dnsSecChecker } from "./dnsSecChecker";
import { DOHResponse } from "./dohResponse";

export default class DomainInspector
  implements Inspector<DomainInspectionType>
{
  constructor(private httpClient: typeof fetch) {}

  async inspect(
    fqdn: string
  ): Promise<{ [key in DomainInspectionType]: InspectionResult }> {
    const response = await this.httpClient(
      // cd=1 parameter to enable DNSSEC validation
      `https://dns.google/resolve?name=${fqdn}&cd=1`
    );
    const json: DOHResponse = await response.json();
    return {
      [DomainInspectionType.DNSSec]: dnsSecChecker(json),
      [DomainInspectionType.CAA]: caaChecker(json),
    };
  }
}
