import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { ISession } from "../types";

export const withSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ISession | null> => {
  return (await unstable_getServerSession(req, res, authOptions)) ?? null;
};
