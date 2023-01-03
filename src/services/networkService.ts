import { ModelsType } from "../db/models";
import { parseNetwork } from "../utils/common";
import { jsonSerializableStage } from "../utils/dbUtils";

const getAll = async (db: ModelsType) => {
  const networks = await db.Network.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "networks",
        as: "users",
        pipeline: [
          {
            $project: {
              _id: 1,
            },
          },
          ...jsonSerializableStage,
        ],
      },
    },
    ...jsonSerializableStage,
  ]);
  return networks;
};

const createNewNetworks = async (networks: string[], db: ModelsType) => {
  // first create all the networks.
  // check which networks do already exist based on the cidr
  const existingNetworks = await db.Network.find({
    cidr: { $in: networks },
  });
  // filter the existing networks.
  const newNetworks = networks.filter(
    (network) =>
      !existingNetworks.find(
        (existingNetwork) => existingNetwork.cidr === network
      )
  );
  // create the new networks.
  return await db.Network.create(newNetworks.map(parseNetwork));
};

export const networkService = {
  getAll,
  createNewNetworks,
};
