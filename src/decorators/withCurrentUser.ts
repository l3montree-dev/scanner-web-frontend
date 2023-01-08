import { User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

import { getServerSession } from "../utils/server";
import { withDB } from "./withDB";

export const withCurrentUser = async (
  ctx: GetServerSidePropsContext
): Promise<User> => {
  const [prisma, session] = await Promise.all([
    withDB(),
    getServerSession(ctx.req, ctx.res, authOptions),
  ]);

  if (!session) {
    // return 500
    ctx.res.statusCode = 500;
    ctx.res.end();
    throw new Error("session is undefined");
  }

  const currentUser = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!currentUser) {
    throw new Error(`currentUser with id: ${session.user.id} not found`);
  }

  return currentUser;
};
