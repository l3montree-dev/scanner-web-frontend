import { ModelsType } from "../db/models";
import { INetwork, IUser } from "../types";
import { jsonSerializableStage } from "../utils/dbUtils";

export const createUser = async (
  user: IUser,
  db: ModelsType
): Promise<[IUser, INetwork[]]> => {
  // first create all the networks.
  // check which networks do already exist based on the cidr
  const existingNetworks = await db.Network.find({
    cidr: { $in: user.networks.map((network) => network.cidr) },
  });
  // filter the existing networks.
  const newNetworks = user.networks.filter(
    (network) =>
      !existingNetworks.find(
        (existingNetwork) => existingNetwork.cidr === network.cidr
      )
  );
  // create the new networks.
  const documents = await db.Network.create(newNetworks);
  // then create the user with the network ids.
  const createdUser = await db.User.create({
    _id: user._id,
    networks: documents.concat(existingNetworks).map((doc) => doc._id),
  });
  return [createdUser, newNetworks];
};

export const getAll = async (db: ModelsType) => {
  const users = await db.User.aggregate([
    {
      $lookup: {
        from: "networks",
        localField: "networks",
        foreignField: "_id",
        as: "networks",
        pipeline: [...jsonSerializableStage],
      },
    },
  ]);
  return users;
};
