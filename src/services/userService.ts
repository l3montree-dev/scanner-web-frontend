import getConnection from "../db/connection";
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
