import mongoose, { Connection, Model, Mongoose } from "mongoose";
import { getLogger } from "../services/logger";
import { models, ModelsType } from "./models";
import { IReport } from "./report";

const logger = getLogger(__filename);

let connectionPromise: Promise<Mongoose> | null = null;
let connection: Connection | null = null;

const addModels = (connection: Connection): Connection => {
  Object.entries(models).forEach(([modelName, schema]) => {
    if (connection.models[modelName] === undefined) {
      connection.model(modelName, schema);
    }
  });
  return connection;
};

async function connect() {
  const dbUrl = process.env.MONGODB_URI;
  if (!dbUrl) {
    throw new Error("MONGODB_URI is not set");
  }
  // handle concurrent requests.
  if (connectionPromise) {
    logger.info(
      "concurrent request detected. Waiting for initial database connection to complete"
    );
    return (await connectionPromise).connection;
  }
  const now = Date.now();
  connectionPromise = mongoose.connect(dbUrl);
  logger
    .child({ duration: Date.now() - now })
    .info("connection to mongo database success");

  // save it in a module variable.
  connection = (await connectionPromise).connection;
  connection = addModels(connection);

  return connection;
}

/**
 * - 0 = disconnected
 * - 1 = connected
 * - 2 = connecting
 * - 3 = disconnecting
 * - 99 = uninitialized
 */
const successReadyStates = [1, 2];
const connectionIsReady = (
  connection: Connection | null
): connection is Connection => {
  if (!connection) {
    return false;
  }
  return successReadyStates.includes(connection.readyState);
};

export default async function getConnection(): Promise<
  Connection & {
    models: ModelsType;
  }
> {
  if (connectionIsReady(connection)) {
    return connection as Connection & {
      models: ModelsType;
    };
  }
  return connect() as Promise<
    Connection & {
      models: ModelsType;
    }
  >;
}
