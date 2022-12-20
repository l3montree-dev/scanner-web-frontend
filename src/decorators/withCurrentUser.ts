import { GetServerSidePropsContext } from "next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { IUser } from "../types";
import { getServerSession } from "../utils/server";

import { withDB } from "./withDB";

export const withCurrentUser = async (
  ctx: GetServerSidePropsContext
): Promise<IUser> => {
  const [{ User }, session] = await Promise.all([
    withDB(),
    getServerSession(ctx.req, ctx.res, authOptions),
  ]);

  if (!session || !User) {
    // return 500
    ctx.res.statusCode = 500;
    ctx.res.end();
    throw new Error("session or user undefined");
  }

  const currentUser = await User.findById(session.user.id);
  if (!currentUser) {
    throw new Error(`currentUser with id: ${session.user.id} not found`);
  }

  return currentUser;
};
