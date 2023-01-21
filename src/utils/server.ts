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

export type DTO<T> = T extends bigint
  ? number
  : T extends Prisma.Decimal
  ? number
  : T extends undefined
  ? null
  : T extends Array<infer U>
  ? DTO<U>[]
  : T extends Date
  ? string
  : T extends object
  ? { [K in keyof T]: DTO<T[K]> }
  : T;

export const toDTO = <T>(v: T): DTO<T> => {
  if (v instanceof Date) {
    return v.toISOString() as DTO<T>;
  }

  if (v === undefined) {
    return null as DTO<T>;
  }
  if (v instanceof Array) {
    return v.map((v) => toDTO(v)) as DTO<T>;
  }
  if (typeof v === "bigint") {
    return Number(v) as DTO<T>;
  }
  if (v instanceof Prisma.Decimal) {
    return v.toNumber() as DTO<T>;
  }
  if (typeof v === "object" && v !== null) {
    return Object.fromEntries(
      Object.entries(v).map(([k, v]) => [k, toDTO(v)])
    ) as DTO<T>;
  }
  return v as DTO<T>;
};

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};
