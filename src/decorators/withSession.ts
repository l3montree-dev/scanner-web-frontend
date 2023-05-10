import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { authOptions } from "../_pages/api/auth/[...nextauth].api";
import { ISession } from "../types";

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
