import { connect, ConnectionOptions, SecureVersion, TLSSocket } from "node:tls";
import { config } from "../config";
import { wait } from "../utils/promise";

export const tlsSocketFactory =
  (timeoutMS: number, maxRetries: number, timeoutBetweenRetriesMS = 500) =>
  (options: ConnectionOptions) => {
    let tries = 0;
    const retry = async (options: ConnectionOptions): Promise<TLSSocket> => {
      return new Promise<TLSSocket>(async (resolve, reject) => {
        try {
          const socket = connect({ timeout: timeoutMS, ...options }, () => {
            resolve(socket);
          });
          socket.on("timeout", reject);
          socket.on("error", reject);
        } catch (error) {
          if (tries < maxRetries) {
            tries++;
            await wait(timeoutBetweenRetriesMS);
            return retry(options);
          }
          reject(error);
        }
      });
    };
    return retry(options);
  };

export const tlsClient = tlsSocketFactory(
  config.serverTimeout,
  config.serverRetries
);

export const tlsClientWithoutRetry = tlsSocketFactory(config.serverTimeout, 0);

export type TLSClient = ReturnType<typeof tlsSocketFactory>;
