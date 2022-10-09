import { exec } from "child_process";

export const openSSL = (args: string[]) => {
  return new Promise((resolve, reject) => {
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
