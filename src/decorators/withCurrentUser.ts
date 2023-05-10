import { User } from "@prisma/client";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { authOptions } from "../_pages/api/auth/[...nextauth].api";
import { Guest } from "../types";
import { isGuestUser } from "../utils/common";

import { getServerSession } from "../utils/server";
import { withDB } from "./withDB";

export const withCurrentUserOrGuest = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | Guest> => {
  const [prisma, session] = await Promise.all([
    withDB(),
    getServerSession(req, res, authOptions),
  ]);

  if (!session) {
    throw new Error("session is undefined");
  }

  // check if guest
  if (isGuestUser(session.user)) {
    return session.user;
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

export const withCurrentUserOrGuestServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<User | Guest> => {
  const [prisma, session] = await Promise.all([
    withDB(),
    getServerSession(ctx.req, ctx.res, authOptions),
  ]);

  if (!session) {
    throw new Error("session is undefined");
  }
  // check if guest
  if (isGuestUser(session.user)) {
    return session.user;
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

export const withCurrentUserServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<User> => {
  const [prisma, session] = await Promise.all([
    withDB(),
    getServerSession(ctx.req, ctx.res, authOptions),
  ]);

  if (!session) {
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

export const withCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User> => {
  const [prisma, session] = await Promise.all([
    withDB(),
    getServerSession(req, res, authOptions),
  ]);

  if (!session) {
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
