import { Prisma } from "@prisma/client";
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

export const toDTO = (v: any): any => {
  if (v instanceof Array) {
    return v.map((v) => toDTO(v));
  }
  if (typeof v === "bigint") {
    return Number(v);
  }
  if (v instanceof Prisma.Decimal) {
    return v.toNumber();
  }
  if (typeof v === "object" && v !== null) {
    return Object.fromEntries(Object.entries(v).map(([k, v]) => [k, toDTO(v)]));
  }
  return v;
};
