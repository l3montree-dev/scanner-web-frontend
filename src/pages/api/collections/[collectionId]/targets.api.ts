import { Collection, PrismaClient, Target, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../../decorators/decorate";
import { withCurrentUser } from "../../../../decorators/withCurrentUser";
import { withDB } from "../../../../decorators/withDB";
import ForbiddenException from "../../../../errors/ForbiddenException";
import MethodNotAllowed from "../../../../errors/MethodNotAllowed";
import { getLogger } from "../../../../services/logger";

const logger = getLogger(__filename);

const handlePost = async (
  collection: Collection,
  targets: Target[],
  currentUser: User,
  prisma: PrismaClient
) => {
  // add the targets to the collection AND the default collection.
  const d = await prisma.targetCollectionRelation.createMany({
    data: targets
      .map((t) => ({
        uri: t.uri,
        collectionId: collection.id,
      }))
      // this is a logical constraint, which needs to be enforced by the application.
      // all targets need to be part of the default collection.
      .concat(
        targets.map((t) => ({
          uri: t.uri,
          collectionId: currentUser.defaultCollectionId,
        }))
      ),
    skipDuplicates: true,
  });

  return d;
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

    const targetsToAdd = req.body as Target[];
    // the user is allowed to add a target to this collection.
    switch (req.method) {
      case "POST":
        return handlePost(collection, targetsToAdd, currentUser, prisma);
      default:
        throw new MethodNotAllowed();
    }
  },
  withDB,
  withCurrentUser
);
