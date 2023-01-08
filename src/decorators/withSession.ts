import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { ISession } from "../types";

export const withSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ISession | null> => {
  return (await unstable_getServerSession(req, res, authOptions)) ?? null;
};

export const withSessionServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<ISession | null> => {
  return (await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  )) as ISession | null;
};
