import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetServerSideProps,
} from "next";
import { getLogger } from "../services/logger";

const logger = getLogger(__filename);

type Extract<
  T extends ReadonlyArray<(ctx: GetServerSidePropsContext) => Promise<any>>
> = {
  [Index in keyof T]: T[Index] extends (
    ctx: GetServerSidePropsContext
  ) => Promise<infer V>
    ? V
    : never;
};

export type DecoratedGetServerSideProps<AdditionalData, Props = {}> = (
  ctx: GetServerSidePropsContext,
  additionalData: AdditionalData
) => GetServerSidePropsResult<Props> | Promise<GetServerSidePropsResult<Props>>;

export const decorateServerSideProps = <
  Decorators extends ReadonlyArray<
    (ctx: GetServerSidePropsContext) => Promise<any>
  >
>(
  handler: DecoratedGetServerSideProps<Extract<Decorators>, any>,
  ...decorators: Decorators
): GetServerSideProps => {
  return async (ctx: GetServerSidePropsContext) => {
    try {
      // @ts-expect-error
      const params = (await Promise.all(
        decorators.map((fn) => fn(ctx))
      )) as Extract<Decorators>;

      return handler(ctx, params);
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
