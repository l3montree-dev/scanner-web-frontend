import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from "next";
import _logger from "next-auth/utils/logger";
import { getLogger } from "../services/logger";

const logger = getLogger(__filename);

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

type Reducer<
  T extends Array<(...params: any[]) => any>,
  Acc = {}
> = T extends []
  ? Acc
  : T extends [infer Head, ...infer Tail]
  ? // @ts-expect-error it is just unknown
    Reducer<Tail, Acc & ReturnVal<Head>>
  : never;

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

export type ServerSidePropsDecorator<T extends Record<string, any>> = (
  context: GetServerSidePropsContext
) => Promise<T>;

export type DecoratedGetServerSideProps<
  AdditionalData extends Record<string, any>,
  Props
> = (
  ctx: GetServerSidePropsContext,
  additionalData: AdditionalData
) => GetServerSidePropsResult<Props> | Promise<GetServerSidePropsResult<Props>>;

export const decorateServerSideProps = <
  Decorators extends ServerSidePropsDecorator<any>[]
>(
  handler: DecoratedGetServerSideProps<Reducer<Decorators>, any>,
  ...decorators: Decorators
): GetServerSideProps => {
  return async (ctx: GetServerSidePropsContext) => {
    try {
      const obj = (await Promise.all(decorators.map((fn) => fn(ctx)))).reduce(
        (prev, curr) => ({
          ...prev,
          ...curr,
        }),
        {}
      ) as Reducer<Decorators>;
      return handler(ctx, obj);
    } catch (e: any) {
      logger.error({ err: e?.message }, "decorateServerSideProps error");
      return {
        props: {},
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  };
};
