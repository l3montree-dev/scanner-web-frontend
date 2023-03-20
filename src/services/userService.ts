import { PrismaClient, User } from "@prisma/client";

const findUserById = async (
  id: string,
  prisma: PrismaClient
): Promise<User> => {
  return prisma.user.findFirstOrThrow({
    where: {
      id,
    },
  });
};

const createUser = async (
  user: { _id: string; role: string },
  prisma: PrismaClient
): Promise<User> => {
  // then create the user with the network ids.
  const createdUser = await prisma.user.create({
    data: {
      id: user._id,
      role: user.role,
      defaultCollection: {
        create: {
          title: "Default",
          color: "#000000",
        },
      },
    },
  });
  return createdUser;
};

const updateUser = async (
  id: string,
  user: { role: string },
  prisma: PrismaClient
): Promise<User> => {
  // then create the user with the network ids.
  const updatedUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: { role: user.role },
  });

  return updatedUser;
};

const getAll = async (prisma: PrismaClient): Promise<User[]> => {
  return await prisma.user.findMany();
};

export const userService = {
  findUserById,
  createUser,
  updateUser,
  getAll,
};
