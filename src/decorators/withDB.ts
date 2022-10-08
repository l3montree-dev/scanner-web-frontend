import { Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import getConnection from "../db/connection";
import { decorate } from "./decorate";

export type DecoratedHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  additionalData: T
) => void | Promise<void>;

export const withDB = decorate(async () => {
  const con = getConnection();
  return (await con).models as {
    Report: Model<any>;
  };
});
