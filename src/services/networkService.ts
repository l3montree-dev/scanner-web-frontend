import { ModelsType } from "../db/models";
import { jsonSerializableStage } from "../utils/dbUtils";

export const getAll = async (db: ModelsType) => {
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
