import { HttpClient } from "../../services/clientHttpClient";
import { getLogger } from "../../services/logger";
import { ServerHttpClient } from "../../services/serverHttpClient";
import { buildInspectionError } from "../../utils/error";
import {
  DomainInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import { caaChecker } from "./caaChecker";
import { dnsSecChecker } from "./dnsSecChecker";

const logger = getLogger(__filename);
export default class DomainInspector
  implements
    Inspector<
      DomainInspectionType,
      { fqdn: string; httpClient: ServerHttpClient }
    >
{
  /*
  Example response:
  {
    "Status": 0 // 0 = SUCCESS
    "TC": false,
    "RD": true,
    "RA": true,
    "AD": true,
    "CD": false,
    "Question": [
        {
        "name": "verwaltung.bund.de.",
        "type": 1 // 1 = A
        }
    ],
    "Answer": [
        {
        "name": "verwaltung.bund.de.",
        "type": 1  // 1 = A
        "TTL": 600,
        "data": "80.245.156.34"
        },
        {
        "name": "verwaltung.bund.de.",
        "type": 46 // 46 = RRSIG
        "TTL": 600,
        "data": "a 8 3 600 1665040681 1664176681 36150 bund.de. T4f/Dr4tnDuUtJhZoZN+JSt6UHwKYtVI3HIbLCKibdrkcgfx9+pf+KUbLuOMwCJXVK6DW61MMmD+cNSGvlXJ26K7UYK012bz1End3r3jciQMHL7ptkhDMW9TnFIELoH1SqzFnb4PGrcjZBK1znsKdkgogOB0wDvUAjkOqgGzrqo="
        }
    ],
    "Comment": "Response from 77.87.224.18."
    }
  */
  async inspect(
    requestId: string,
    { fqdn, httpClient }: { fqdn: string; httpClient: ServerHttpClient }
  ): Promise<{ [key in DomainInspectionType]: InspectionResult }> {
    try {
      const [response, caaResponse] = await Promise.all([
        httpClient(
          `https://dns.google/resolve?name=${fqdn}&do=true`,
          requestId
        ).then(async (r) => {
          return r.json();
        }),
        httpClient(
          `https://dns.google/resolve?name=${fqdn}&do=true&type=CAA`,
          requestId
        ).then((r) => r.json()),
      ]);

      return {
        [DomainInspectionType.DNSSec]: dnsSecChecker(response),
        [DomainInspectionType.CAA]: caaChecker(caaResponse),
      };
    } catch (e: unknown) {
      logger.error(
        { err: e, requestId },
        `domain inspection for ${fqdn} failed`
      );
      return buildInspectionError(DomainInspectionType, e);
    }
  }
}
