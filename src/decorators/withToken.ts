import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { IToken } from "../types";

export const withToken = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ token: IToken | null }> => {
  return {
    token: ((await getToken({
      req,
    })) ?? null) as unknown as IToken,
  };
};
