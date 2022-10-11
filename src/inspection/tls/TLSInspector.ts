import { getCiphers, SecureVersion } from "node:tls";
import { getLogger } from "../../services/logger";
import { OpenSSL } from "../../services/openssl";
import { TLSClient } from "../../services/tlsSocket";
import { protocols } from "../../utils/tls";
import { InspectionResult, Inspector, TLSInspectionType } from "../Inspector";

const logger = getLogger(__filename);
export default class TLSInspector implements Inspector<TLSInspectionType> {
  constructor(
    private tlsClient: TLSClient,
    private tlsClientWithoutRetries: TLSClient
  ) {}
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
      this.tls12Supported(fqdn),
      this.tls13Supported(fqdn),
      this.tls11NotSupported(fqdn),
      this.sslDeactivatedChecker(fqdn),
      this.serverPreferredCiphers(fqdn),
      this.cipherSupportedAcrossProtocols(fqdn, "HIGH"),
      this.cipherSupportedAcrossProtocols(fqdn, "MEDIUM"),
      this.cipherSupportedAcrossProtocols(fqdn, "LOW"),
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

  private async tlsVersionSupported(fqdn: string, tlsVersion: SecureVersion) {
    try {
      const socket = await this.tlsClientWithoutRetries({
        port: 443,
        host: fqdn,
        servername: fqdn,
        maxVersion: tlsVersion,
        minVersion: tlsVersion,
        rejectUnauthorized: false,
      });
      // close the connection
      socket.destroy();
      return true;
    } catch (e) {
      return false;
    }
  }
  // 'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`
  private async tls12Supported(fqdn: string) {
    return new InspectionResult(
      TLSInspectionType.TLSv1_2,
      await this.tlsVersionSupported(fqdn, "TLSv1.2"),
      {}
    );
  }

  private async tls13Supported(fqdn: string) {
    return new InspectionResult(
      TLSInspectionType.TLSv1_3,
      await this.tlsVersionSupported(fqdn, "TLSv1.3"),
      {}
    );
  }

  private async tls11NotSupported(fqdn: string) {
    // we can only check for TLSv1.1 support using the prebuild openssl binary.
    const [tls11Supported, tls10Supported] = await Promise.all([
      OpenSSL.isTLS11Supported(fqdn),
      OpenSSL.isTLS1Supported(fqdn),
    ]);
    return new InspectionResult(
      TLSInspectionType.TLSv1_1_Deactivated,
      !tls11Supported && !tls10Supported,
      {
        tls11Supported,
        tls10Supported,
      }
    );
  }

  private async sslDeactivatedChecker(fqdn: string) {
    const ssl3Supported = await OpenSSL.isSSL3Supported(fqdn);
    return new InspectionResult(
      TLSInspectionType.SSLDeactivated,
      !ssl3Supported,
      {}
    );
  }

  serverPreferredCiphers = async (
    fqdn: string
  ): Promise<{ [key in SecureVersion]: string[] }> => {
    const ciphers = getCiphers().map((cipher) => cipher.toUpperCase());

    const now = Date.now();

    const cipherPreference = (
      await Promise.all(
        protocols.map(async (protocol) => {
          const supportedCiphers: string[] = [];
          let testCiphers = [...ciphers];
          // to keep the request count low, do it sequentially
          // iterate over all cipher suites and check if they are supported
          while (testCiphers.length > 0) {
            try {
              const socket = await this.tlsClientWithoutRetries({
                host: fqdn,
                ciphers: testCiphers.join(":"),
                port: 443,
                servername: fqdn,
                // honorCipherOrder: true,
                maxVersion: protocol,
                minVersion: protocol,
              });

              const selectedCipher = socket.getCipher().name.toUpperCase();
              // add it to the list of supported ciphers
              // the list is ordered - therefore use push, to append it to the end of the array.
              supportedCiphers.push(selectedCipher);

              const index = testCiphers.indexOf(selectedCipher);
              if (index === -1) {
                throw new Error(
                  `Cipher ${selectedCipher} not found in ${testCiphers.join(
                    ", "
                  )}`
                );
              }
              // remove the preferred cipher suite from the array.
              testCiphers.splice(index, 1);
              // destroy the socket connection.
              socket.destroy();
            } catch (e) {
              break;
            }
          }
          return supportedCiphers;
        })
      )
    ).reduce(
      (acc, supportedCiphers, index) => ({
        ...acc,
        [protocols[index]]: supportedCiphers,
      }),
      {} as { [key in SecureVersion]: string[] }
    );

    logger.debug(
      `serverSupportedCiphers took ${Date.now() - now}ms for ${fqdn}`
    );
    return cipherPreference;
  };

  async cipherSupported(fqdn: string, cipher: string, protocol: SecureVersion) {
    try {
      // we are actually expecting failures. Retrying would be rather nonsense.
      const socket = await this.tlsClientWithoutRetries({
        host: fqdn,
        ciphers: cipher,
        port: 443,
        servername: fqdn,
        honorCipherOrder: true,
        maxVersion: protocol,
        minVersion: protocol,
      });

      socket.destroy();
      return true;
    } catch (e) {
      return false;
    }
  }

  cipherSupportedAcrossProtocols = async (fqdn: string, cipher: string) => {
    return (
      await Promise.all(
        protocols.map(async (protocol) =>
          this.cipherSupported(fqdn, cipher, protocol)
        )
      )
    ).reduce((acc, curr, currIndex) => {
      return {
        ...acc,
        [protocols[currIndex]]: curr,
      };
    }, {} as { [key in SecureVersion]: boolean });
  };
}
