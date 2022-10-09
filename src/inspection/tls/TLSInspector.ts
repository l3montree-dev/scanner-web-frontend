import { InspectionResult, Inspector, TLSInspectionType } from "../Inspector";
import {
  cipherSupportedAcrossProtocols,
  serverPreferredCiphers,
} from "./cipherSuitesChecker";
import {
  sslDeactivatedChecker,
  tls11NotSupported,
  tls12Supported,
  tls13Supported,
} from "./tlsChecker";

export default class TLSInspector implements Inspector<TLSInspectionType> {
  async inspect(
    fqdn: string
  ): Promise<{ [key in TLSInspectionType]: InspectionResult }> {
    const [
      tls12SupportedResult,
      tls13SupportedResult,
      tls11NotSupportedResult,
      sslDeactivatedResult,
      preferredCiphers,
      highSupported,
      medSupported,
      lowSupported,
    ] = await Promise.all([
      tls12Supported(fqdn),
      tls13Supported(fqdn),
      tls11NotSupported(fqdn),
      sslDeactivatedChecker(fqdn),
      serverPreferredCiphers(fqdn),
      cipherSupportedAcrossProtocols(fqdn, "HIGH"),
      cipherSupportedAcrossProtocols(fqdn, "MEDIUM"),
      cipherSupportedAcrossProtocols(fqdn, "LOW"),
    ]);

    return {
      TLSv1_2: tls12SupportedResult,
      TLSv1_3: tls13SupportedResult,
      SSLDeactivated: sslDeactivatedResult,
      // make sure, that TLS v.1.1 and older is not supported
      TLSv1_1_Deactivated: tls11NotSupportedResult,
      // string Key-Exchange (min. 2048 bit for DHE; min. 256 bit for
      // prefer ECDHE
      StrongKeyExchange: new InspectionResult(
        TLSInspectionType.TLSv1_2,
        true,
        {}
      ),
      StrongCipherSuites: new InspectionResult(
        TLSInspectionType.StrongCipherSuites,
        true,
        {
          preferredCiphers,
          highSupported,
          medSupported,
          lowSupported,
        }
      ),
    };
  }
}
