export const jsonSerializableStage = [
  {
    $addFields: {
      id: {
        $toString: "$_id",
      },
      createdAt: {
        $toString: "$createdAt",
      },
      updatedAt: {
        $toString: "$updatedAt",
      },
    },
  },
  {
    $unset: ["_id", "__v"],
  },
];
