import { spawn } from "child_process";

export const openSSL = (args: string[]) => {
  const process = spawn("openssl", args);
  return new Promise((resolve, reject) => {
    const stdOut: any[] = [];
    const stdErr: any[] = [];
    process.stdout.on("data", (data) => {
      stdOut.push(data.toString());
    });
    process.stderr.on("data", (data) => {
      stdErr.push(data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdOut.join("\n"));
      } else {
        reject(stdErr.join("\n"));
      }
    });
  });
};
