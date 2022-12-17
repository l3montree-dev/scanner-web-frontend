import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { Token } from "../types";

export const withToken = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ token: Token | null }> => {
  return {
    token: ((await getToken({
      req,
    })) ?? null) as unknown as Token,
  };
};
