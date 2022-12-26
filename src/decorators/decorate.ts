import { NextApiRequest, NextApiResponse } from "next";

import HttpError from "../errors/HttpError";
import { getLogger } from "../services/logger";

export type DecoratedHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  additionalData: T
) => void | Promise<void> | Promise<Record<string, any> | null>;

type Extract<
  T extends ReadonlyArray<
    (req: NextApiRequest, res: NextApiResponse) => Promise<any>
  >
> = {
  [Index in keyof T]: T[Index] extends (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<infer V>
    ? V
    : never;
};

export type Decorator<T extends Record<string, any>> = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<T>;

const logger = getLogger(__filename);

export const decorate = <Decorators extends Decorator<any>[]>(
  handler: DecoratedHandler<Extract<Decorators>>,
  ...decorators: Decorators
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const obj = (await Promise.all(
        decorators.map((fn) => fn(req, res))
      )) as Extract<Decorators>;
      const returnValue = await handler(req, res, obj);
      if (returnValue) {
        return res.status(200).json(returnValue);
      }
    } catch (e: any) {
      logger.error({ err: e.message }, "decorate error");
      if (e instanceof HttpError) {
        return res.status(e.status).json({ message: e.message });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
