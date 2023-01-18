import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import ForbiddenException from "../errors/ForbiddenException";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { ISession } from "../types";
import { isAdmin } from "../utils/common";

export const withAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ISession | null> => {
  const session: ISession | null =
    (await unstable_getServerSession(req, res, authOptions)) ?? null;
  if (!isAdmin(session)) {
    throw new ForbiddenException();
  }
  return session;
};
