import mongoose, { Connection, Mongoose } from "mongoose";
import { getLogger } from "../services/logger";
import { models, ModelsType } from "./models";

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
  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST;
  const port = process.env.MONGODB_PORT;
  const db = process.env.MONGODB_DATABASE;

  if (!user || !password || !host || !port) {
    throw new Error(
      "Missing environment variables: MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_PORT"
    );
  }
  const dbUrl = `mongodb://${user}:${password}@${host}:${port}/${db}`;

  // handle concurrent requests.
  if (connectionPromise) {
    logger.info(
      "concurrent request detected. Waiting for initial database connection to complete"
    );
    return (await connectionPromise).connection;
  }

  connectionPromise = mongoose.connect(dbUrl);

  // save it in a module variable.
  connection = (await connectionPromise).connection;
  connection = addModels(connection);

  connection.db.createIndex(
    "domains",
    {
      fqdn: 1,
      ipV4AddressNumber: 1,
    },
    { unique: true }
  );
  connection.db.createIndex("networks", { cidr: 1 }, { unique: true });

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
