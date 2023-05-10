import { NextApiRequest, NextApiResponse } from "next";

import HttpError from "../errors/HttpError";
import { getLogger } from "../services/logger";
import { NextRequest, NextResponse } from "next/server";

export type DecoratedHandler<T> = (
  req: NextRequest,
  additionalData: T
) => void | NextResponse | Promise<void> | Promise<Record<string, any> | null>;

type Extract<T extends ReadonlyArray<(req: NextRequest) => Promise<any>>> = {
  [Index in keyof T]: T[Index] extends (req: NextRequest) => Promise<infer V>
    ? V
    : never;
};

export type Decorator<T extends Record<string, any>> = (
  req: NextRequest
) => Promise<T>;

const logger = getLogger(__filename);

export const decorate = <Decorators extends Decorator<any>[]>(
  handler: DecoratedHandler<Extract<Decorators>>,
  ...decorators: Decorators
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const obj = (await Promise.all(
        decorators.map((fn) => fn(req))
      )) as Extract<Decorators>;
      const returnValue = await handler(req, obj);
      if (returnValue instanceof NextResponse) {
        return returnValue;
      }

      if (returnValue) {
        return NextResponse.json(returnValue, { status: 200 });
      }
      return NextResponse.json({ message: "OK" }, { status: 200 });
    } catch (e: any) {
      logger.error({ err: e.message }, "decorate error");
      if (e instanceof HttpError) {
        return NextResponse.json({ message: e.message }, { status: e.status });
      }
      return NextResponse.json(
        { message: "Internal Server Error" },
        {
          status: 500,
        }
      );
    }
  };
};
