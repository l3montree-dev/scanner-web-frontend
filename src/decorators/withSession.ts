import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { Session } from "../types";
import { decorate } from "./decorate";

export const withSession = decorate<Session | null>(
  async (req, res): Promise<any | null> => {
    return (await unstable_getServerSession(req, res, authOptions)) ?? null;
  }
);
