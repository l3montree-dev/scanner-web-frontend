import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../decorators/decorate";
import { withCurrentUser } from "../../../decorators/withCurrentUser";
import { withDB } from "../../../decorators/withDB";
import ForbiddenException from "../../../errors/ForbiddenException";
import MethodNotAllowed from "../../../errors/MethodNotAllowed";

import { getLogger } from "../../../services/logger";

const logger = getLogger(__filename);

const deleteCollection = async (
  collectionId: number,
  user: User,
  prisma: PrismaClient
) => {
  // check if the user is the owner of the collection
  const tag = await prisma.collection.findUnique({
    where: {
      id: collectionId,
    },
  });
  if (tag?.ownerId !== user.id) {
    throw new ForbiddenException();
  }

  // the user is allowed to delete the collection.
  return prisma.collection.delete({
    where: {
      id: collectionId,
    },
  });
};

const handleDelete = async (
  req: NextApiRequest,
  res: NextApiResponse,
  currentUser: User,
  prisma: PrismaClient
) => {
  const { collectionId } = req.body;
  await deleteCollection(collectionId, currentUser, prisma);
  return res.send({ success: true });
};

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse,
  currentUser: User,
  prisma: PrismaClient
) => {
  const collection: { title: string; color: string } = req.body;

  const d = await prisma.collection.create({
    data: {
      title: collection.title,
      color: collection.color,
      owner: {
        connect: {
          id: currentUser.id,
        },
      },
    },
    include: {
      shareLinks: true,
    },
  });

  return res.send(d);
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [prisma, session]) => {
    if (!session) {
      throw new ForbiddenException();
    }
    switch (req.method) {
      case "DELETE":
        return handleDelete(req, res, session, prisma);
      case "POST":
        return handlePost(req, res, session, prisma);
      default:
        throw new MethodNotAllowed();
    }
  },
  withDB,
  withCurrentUser
);
