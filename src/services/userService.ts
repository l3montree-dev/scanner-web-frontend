import getConnection from "../db/connection";

export const findUserById = async (id: string) => {
  const { models } = await getConnection();
  return models.User.findById(id).lean();
};
