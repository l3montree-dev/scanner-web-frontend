import { getCiphers, SecureVersion } from "node:tls";
import { getLogger } from "../../utils/logger";
import { protocols, tlsConnect } from "./connection";

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
            supportedCiphers.push(selectedCipher);

            const index = testCiphers.indexOf(selectedCipher);
            if (index === -1) {
              console.error(
                "cipher not found in list",
                socket.getCipher(),
                testCiphers
              );
              throw new Error(
                `Cipher ${selectedCipher} not found in ${testCiphers.join(
                  ", "
                )}`
              );
            }
            testCiphers.splice(index, 1);
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
