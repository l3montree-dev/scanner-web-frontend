import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getToken } from "next-auth/jwt";
import { IToken } from "../types";

export const withToken = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<IToken> => {
  return ((await getToken({
    req,
  })) ?? null) as unknown as IToken;
};

export const withTokenServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<IToken> => {
  return ((await getToken({
    req: context.req,
  })) ?? null) as unknown as IToken;
};
