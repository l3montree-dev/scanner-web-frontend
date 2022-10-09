import { exec } from "child_process";
import { promise2Boolean } from "../utils/promise";

const openSSL = (args: string[]) => {
  return new Promise<string>((resolve, reject) => {
    /**
     * !!!! If running inside the provided Docker Image, this uses OpenSSL 1.0.2 !!!!
     * This supports SSLv2 and SSLv3 but does NOT support TLSv1.3. Use the openssl binary linked with node itself to verify TLSv1.3 support.
     */
    exec(`echo 'Q' | openssl ${args.join(" ")}`, (err, stdout) => {
      if (err !== null) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
};

export const isTLS11Supported = (fqdn: string): Promise<boolean> => {
  return promise2Boolean(
    openSSL(["s_client", "-connect", `${fqdn}:443`, "-tls1_1"])
  );
};

export const isTLS1Supported = (fqdn: string): Promise<boolean> => {
  return promise2Boolean(
    openSSL(["s_client", "-connect", `${fqdn}:443`, "-tls1"])
  );
};

export const isSSL3Supported = (fqdn: string): Promise<boolean> => {
  return promise2Boolean(
    openSSL(["s_client", "-connect", `${fqdn}:443`, "-ssl3"])
  );
};
