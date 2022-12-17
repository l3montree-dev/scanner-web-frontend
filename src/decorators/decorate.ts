import { NextApiRequest, NextApiResponse } from "next";

export type DecoratedHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  additionalData: T
) => void | Promise<void>;

export type Decorator<T extends Record<string, any>> = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<T>;

type ReturnVal<Item> = Item extends (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<infer ReturnVal>
  ? ReturnVal
  : never;

type Reducer<T extends Array<Decorator<any>>, Acc = {}> = T extends []
  ? Acc
  : T extends [infer Head, ...infer Tail]
  ? // @ts-expect-error it is just unknown
    Reducer<Tail, Acc & ReturnVal<Head>>
  : never;

type X = ReturnVal<Decorator<{ s: string }>>;
export const decorate = <Decorators extends Decorator<any>[]>(
  handler: DecoratedHandler<Reducer<Decorators>>,
  ...decorators: Decorators
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const obj = (
      await Promise.all(decorators.map((fn) => fn(req, res)))
    ).reduce(
      (prev, curr) => ({
        ...prev,
        ...curr,
      }),
      {}
    ) as Reducer<Decorators>;
    return handler(req, res, obj);
  };
};
