import { TLSClient } from "../../services/tlsSocket";
import { buildInspectionError } from "../../utils/error";

import {
  CertificateInspectionType,
  InspectionResult,
  Inspector,
} from "../Inspector";
import {
  isStrongPrivateKeyChecker,
  isValidCertificateChainChecker,
  isValidChecker,
  matchesHostnameChecker,
} from "./certificateChecker";

export default class CertificateInspector
  implements Inspector<CertificateInspectionType>
{
  constructor(private tlsClient: TLSClient) {}

  async inspect(
    fqdn: string
  ): Promise<{ [key in CertificateInspectionType]: InspectionResult }> {
    try {
      const socket = await this.tlsClient({
        host: fqdn,
        port: 443,
        servername: fqdn,
        // do not reject, if the certificate is invalid - otherwise we do not get any response.
        rejectUnauthorized: false,
      });
      const certificate = socket.getPeerCertificate(true);

      return {
        [CertificateInspectionType.ValidCertificate]:
          isValidChecker(certificate),
        [CertificateInspectionType.ValidCertificateChain]:
          isValidCertificateChainChecker(certificate),
        [CertificateInspectionType.MatchesHostname]: matchesHostnameChecker(
          certificate,
          fqdn
        ),

        [CertificateInspectionType.StrongPrivateKey]:
          isStrongPrivateKeyChecker(certificate),
        [CertificateInspectionType.StrongSignatureAlgorithm]:
          new InspectionResult(
            CertificateInspectionType.StrongSignatureAlgorithm,
            true,
            {}
          ),
        [CertificateInspectionType.NotRevoked]: new InspectionResult(
          CertificateInspectionType.NotRevoked,
          false,
          {}
        ),
        [CertificateInspectionType.CertificateTransparency]:
          new InspectionResult(
            CertificateInspectionType.CertificateTransparency,
            false,
            {}
          ),
      };
    } catch (e) {
      return buildInspectionError(CertificateInspectionType, e);
    }
  }
}
