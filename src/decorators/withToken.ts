import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getToken } from "next-auth/jwt";
import { IToken } from "../types";
import { NextRequest } from "next/server";

export const withToken = async (req: NextRequest): Promise<IToken> => {
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
