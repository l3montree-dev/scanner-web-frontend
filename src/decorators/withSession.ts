import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { ISession } from "../types";
import { getServerSession } from "../utils/server";

export const withSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ISession | null> => {
  return (await getServerSession(req, res, authOptions)) ?? null;
};

export const withSessionServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<ISession | null> => {
  return (
    (await getServerSession(context.req, context.res, authOptions)) ?? null
  );
};
