import { PrismaClient, User } from "@prisma/client";

const getAllCollectionsOfUser = async (user: User, prisma: PrismaClient) => {
  const collections = await prisma.collection.findMany({
    where: {
      OR: [
        {
          ownerId: user.id,
        },
        {
          user: {
            some: {
              id: user.id,
            },
          },
        },
        {
          id: user.defaultCollectionId,
        },
      ],
    },
  });
  return collections;
};

const getCollectionsOfTargets = async (
  targetUris: string[],
  user: User,
  prisma: PrismaClient
) => {
  const collections = await prisma.targetCollectionRelation.findMany({
    where: {
      OR: [
        {
          uri: {
            in: targetUris,
          },
          collection: {
            id: user.defaultCollectionId, // user has access to the collection if its his default collection
          },
        },
        {
          uri: {
            in: targetUris,
          },
          collection: {
            user: {
              some: {
                id: user.id, // or if it is shared with the user
              },
            },
          },
        },
        {
          uri: {
            in: targetUris,
          },
          collection: {
            ownerId: user.id, // or if he is the creator of the collection
          },
        },
      ],
    },
  });
  return collections;
};

export const collectionService = {
  getAllCollectionsOfUser,
  getCollectionsOfTargets,
};
