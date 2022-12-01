import { Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import getConnection from "../db/connection";
import { getLogger } from "../services/logger";
import CircuitBreaker from "../utils/CircuitBreaker";
import { timeout } from "../utils/promise";
import { decorate } from "./decorate";

const logger = getLogger(__filename);
export type DecoratedHandler<T> = (
  req: NextApiRequest,
  res: NextApiResponse,
  additionalData: T
) => void | Promise<void>;

// try again after two minutes.
const databaseCircuitBreaker = new CircuitBreaker(2, 2 * 60 * 1000);
export const withDB = decorate(async () => {
  try {
    const con = databaseCircuitBreaker.run(() => timeout(getConnection()));
    return (await con).models as {
      Report: Model<any>;
    };
  } catch (err) {
    logger.warn({ err }, "could not connect to database");
    return {
      Report: null,
    };
  }
});
