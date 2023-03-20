import { randomUUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../../decorators/decorate";
import { withCurrentUser } from "../../../../decorators/withCurrentUser";
import { withDB } from "../../../../decorators/withDB";
import ForbiddenException from "../../../../errors/ForbiddenException";
import MethodNotAllowed from "../../../../errors/MethodNotAllowed";
import { toDTO } from "../../../../utils/server";

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

    // the user is allowed to add a target to this collection.
    switch (req.method) {
      case "POST":
        const link = await prisma.shareLink.create({
          data: {
            // generate a random secret
            secret: randomUUID(),
            collection: {
              connect: {
                id: collectionId,
              },
            },
          },
        });
        return toDTO(link);
      default:
        throw new MethodNotAllowed();
    }
  },
  withDB,
  withCurrentUser
);
