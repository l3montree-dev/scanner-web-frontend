import { GetServerSidePropsContext } from "next";
import { AuthOptions, unstable_getServerSession } from "next-auth";
import { Stream } from "stream";
import { ISession } from "../types";

export const getServerSession = (
  req: GetServerSidePropsContext["req"],
  res: GetServerSidePropsContext["res"],
  options: AuthOptions
): Promise<ISession | null> => {
  return unstable_getServerSession(req, res, options);
};

export async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(`error converting stream - ${err}`));
  });
}
