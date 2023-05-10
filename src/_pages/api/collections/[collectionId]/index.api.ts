import { Collection, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../../decorators/decorate";
import { withCurrentUser } from "../../../../decorators/withCurrentUser";
import { withDB } from "../../../../decorators/withDB";
import ForbiddenException from "../../../../errors/ForbiddenException";
import MethodNotAllowed from "../../../../errors/MethodNotAllowed";
import NotFoundException from "../../../../errors/NotFoundException";
import { collectionService } from "../../../../services/collectionService";

const handleDelete = async (collection: Collection, prisma: PrismaClient) => {
  // delete the collection
  return prisma.collection.delete({
    where: {
      id: collection.id,
    },
  });
};

const handleUpdate = async (
  collection: Collection,
  req: NextApiRequest,
  prisma: PrismaClient
) => {
  // update the collection
  return prisma.collection.update({
    where: {
      id: collection.id,
    },
    data: {
      title: req.body.title,
      color: req.body.color,
    },
    include: {
      shareLinks: true,
    },
  });
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [prisma, currentUser]) => {
    // fetch the collection and check if the user is allowed.
    const collection: Collection | null = await prisma.collection.findFirst({
      where: {
        id: parseInt(req.query.collectionId as string),
      },
    });
    if (!collection) {
      throw new NotFoundException();
    }

    if (
      !collectionService.isUserAllowedToModifyCollection(
        collection,
        currentUser
      )
    ) {
      throw new ForbiddenException();
    }

    switch (req.method) {
      case "DELETE":
        return handleDelete(collection, prisma);
      case "PUT":
        return handleUpdate(collection, req, prisma);
      default:
        throw new MethodNotAllowed();
    }
  },
  withDB,
  withCurrentUser
);
