import { getCiphers, SecureVersion } from "node:tls";
import { getLogger } from "../../services/logger";
import { protocols, tlsConnect } from "../../utils/tls";

const logger = getLogger(__filename);

export const serverPreferredCiphers = async (
  fqdn: string
): Promise<{ [key in SecureVersion]: string[] }> => {
  const ciphers = getCiphers().map((cipher) => cipher.toUpperCase());

  const now = performance.now();

  const cipherPreference = (
    await Promise.all(
      protocols.map(async (protocol) => {
        const supportedCiphers: string[] = [];
        let testCiphers = [...ciphers];
        // to keep the request count low, do it sequentially
        // iterate over all cipher suites and check if they are supported
        while (testCiphers.length > 0) {
          try {
            const socket = await tlsConnect({
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
    `serverSupportedCiphers took ${performance.now() - now}ms for ${fqdn}`
  );
  return cipherPreference;
};

const cipherSupported = async (
  fqdn: string,
  cipher: string,
  protocol: SecureVersion
) => {
  try {
    const socket = await tlsConnect({
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
};

export const cipherSupportedAcrossProtocols = async (
  fqdn: string,
  cipher: string
) => {
  return (
    await Promise.all(
      protocols.map(async (protocol) => cipherSupported(fqdn, cipher, protocol))
    )
  ).reduce((acc, curr, currIndex) => {
    return {
      ...acc,
      [protocols[currIndex]]: curr,
    };
  }, {} as { [key in SecureVersion]: boolean });
};
