import getConnection from "../db/connection";
import { ModelsType } from "../db/models";
import { AppUser, IUser } from "../types";
import { jsonSerializableStage } from "../utils/dbUtils";

const findUserById = async (id: string): Promise<AppUser> => {
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

const createUser = async (user: IUser, db: ModelsType): Promise<IUser> => {
  // then create the user with the network ids.
  const createdUser = await db.User.create({
    _id: user._id,
    role: user.role,
  });
  return createdUser;
};

const updateUser = async (
  id: string,
  user: IUser,
  db: ModelsType
): Promise<IUser | null> => {
  // then create the user with the network ids.
  const updatedUser = await db.User.findOneAndUpdate(
    {
      _id: id,
    },
    {
      role: user.role,
    },
    { new: true }
  ).lean();

  return updatedUser;
};

const getAll = async (db: ModelsType): Promise<IUser[]> => {
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

export const userService = {
  findUserById,
  createUser,
  updateUser,
  getAll,
};
