import { NextApiRequest, NextApiResponse } from "next";
import ForbiddenException from "../errors/ForbiddenException";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { ISession } from "../types";
import { isAdmin } from "../utils/common";
import { getServerSession } from "../utils/server";

export const withAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ISession | null> => {
  const session: ISession | null =
    (await getServerSession(req, res, authOptions)) ?? null;
  if (!isAdmin(session)) {
    throw new ForbiddenException();
  }
  return session;
};
