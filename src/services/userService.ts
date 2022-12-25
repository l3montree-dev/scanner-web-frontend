import getConnection from "../db/connection";
import { ModelsType } from "../db/models";
import { IUser, INetwork, WithoutId } from "../types";
import { jsonSerializableStage } from "../utils/dbUtils";

export const findUserById = async (id: string) => {
  const { models } = await getConnection();

  const res = await models.User.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: "networks",
        localField: "networks",
        foreignField: "_id",
        as: "networks",
        pipeline: [...jsonSerializableStage],
      },
    },
    ...jsonSerializableStage,
  ]).limit(1);

  return res[0];
};

export const createUser = async (
  user: Omit<IUser, "networks"> & { networks: WithoutId<INetwork>[] },
  db: ModelsType
): Promise<[IUser, WithoutId<INetwork>[]]> => {
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
