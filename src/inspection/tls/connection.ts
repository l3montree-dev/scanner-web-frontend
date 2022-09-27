import { ConnectionOptions, TLSSocket, connect, SecureVersion } from "tls";

export const protocols: Array<SecureVersion> = [
  "TLSv1.2",
  "TLSv1.3",
  "TLSv1.1",
  "TLSv1",
];

export const tlsConnect = (options: ConnectionOptions) => {
  return new Promise<TLSSocket>((resolve, reject) => {
    const socket = connect(options, () => {
      resolve(socket);
    });

    socket.on("timeout", reject);
    socket.on("error", reject);
  });
};
