import { NextApiRequest, NextApiResponse } from "next";

export type DecoratedHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  additionalData: T
) => void | Promise<void>;

export const decorate =
  <T>(fn: () => Promise<T>) =>
  (handler: DecoratedHandler<T>) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    handler(req, res, await fn());
  };
