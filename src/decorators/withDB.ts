import getConnection from "../db/connection";
import { ModelsType } from "../db/models";
import { getLogger } from "../services/logger";
import CircuitBreaker from "../utils/CircuitBreaker";
import { timeout } from "../utils/common";

const logger = getLogger(__filename);

// try again after two minutes.
const databaseCircuitBreaker = new CircuitBreaker(2, 2 * 60 * 1000);
export const withDB = async (): Promise<Partial<ModelsType>> => {
  try {
    const con = databaseCircuitBreaker.run(() => timeout(getConnection()));
    return (await con).models as ModelsType;
  } catch (err) {
    logger.warn({ err }, "could not connect to database");
    return {
      Report: undefined,
      User: undefined,
      Domain: undefined,
    };
  }
};
