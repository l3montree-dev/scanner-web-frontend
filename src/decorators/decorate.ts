import { NextApiRequest, NextApiResponse } from "next";
import _logger from "next-auth/utils/logger";

export type DecoratedHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  additionalData: T
) => void | Promise<void>;

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

export const decorate = <Decorators extends Decorator<any>[]>(
  handler: DecoratedHandler<Extract<Decorators>>,
  ...decorators: Decorators
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const obj = (await Promise.all(
      decorators.map((fn) => fn(req, res))
    )) as Extract<Decorators>;
    return handler(req, res, obj);
  };
};
