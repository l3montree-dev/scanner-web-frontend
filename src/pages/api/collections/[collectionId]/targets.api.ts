import { Collection, PrismaClient, Target, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../../decorators/decorate";
import { withCurrentUser } from "../../../../decorators/withCurrentUser";
import { withDB } from "../../../../decorators/withDB";
import ForbiddenException from "../../../../errors/ForbiddenException";
import MethodNotAllowed from "../../../../errors/MethodNotAllowed";
import { targetCollectionService } from "../../../../services/targetCollectionService";
import { toDTO } from "../../../../utils/server";

const handlePost = async (
  collection: Collection,
  targets: Target[],
  prisma: PrismaClient
) => {
  // add the targets to the collection AND the default collection.
  return targetCollectionService.createConnection(
    targets.map((t) => t.uri),
    collection.id,
    prisma
  );
};

const handleDelete = async (
  collection: Collection,
  targets: Target[],
  prisma: PrismaClient
) => {
  return targetCollectionService.deleteConnection(
    targets.map((t) => t.uri),
    collection.id,
    prisma
  );
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [prisma, currentUser]) => {
    const collectionId = parseInt(req.query.collectionId as string);
    if (isNaN(collectionId)) {
      throw new MethodNotAllowed();
    }

    // fetch the collection from the database
    const collection = await prisma.collection.findUnique({
      where: {
        id: collectionId,
      },
    });

    if (
      !collection ||
      (collection?.ownerId !== currentUser.id &&
        currentUser.defaultCollectionId !== collectionId)
    ) {
      throw new ForbiddenException();
    }

    const targets = req.body as Target[];
    // the user is allowed to add a target to this collection.
    switch (req.method) {
      case "POST":
        return toDTO(await handlePost(collection, targets, prisma));
      case "DELETE":
        return toDTO(await handleDelete(collection, targets, prisma));
      default:
        throw new MethodNotAllowed();
    }
  },
  withDB,
  withCurrentUser
);
