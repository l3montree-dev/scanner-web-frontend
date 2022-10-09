import { connect, ConnectionOptions, SecureVersion, TLSSocket } from "node:tls";

export const tlsConnect = (options: ConnectionOptions) => {
  return new Promise<TLSSocket>((resolve, reject) => {
    const socket = connect(options, () => {
      resolve(socket);
    });

    socket.on("timeout", reject);
    socket.on("error", reject);
  });
};

export const protocols: Array<SecureVersion> = ["TLSv1.2", "TLSv1.3"];
