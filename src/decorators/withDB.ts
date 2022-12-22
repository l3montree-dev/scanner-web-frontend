import getConnection from "../db/connection";
import { ModelsType } from "../db/models";
import CircuitBreaker from "../utils/CircuitBreaker";
import { timeout } from "../utils/common";

// try again after two minutes.
const databaseCircuitBreaker = new CircuitBreaker(2, 2 * 60 * 1000);
export const withDB = async (): Promise<ModelsType> => {
  const con = databaseCircuitBreaker.run(() => timeout(getConnection()));
  return (await con).models as ModelsType;
};
