import { Collection, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../decorators/decorate";
import { withCurrentUser } from "../../../decorators/withCurrentUser";
import { withDB } from "../../../decorators/withDB";
import ForbiddenException from "../../../errors/ForbiddenException";
import MethodNotAllowed from "../../../errors/MethodNotAllowed";
import NotFoundException from "../../../errors/NotFoundException";
import { collectionService } from "../../../services/collectionService";

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [prisma, currentUser]) => {
    // fetch the sharelink
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        secret: req.query.secret as string,
      },
      include: {
        collection: true,
      },
    });
    if (!shareLink) {
      throw new NotFoundException();
    }

    if (
      !collectionService.isUserAllowedToModifyCollection(
        shareLink.collection,
        currentUser
      )
    ) {
      throw new ForbiddenException();
    }

    switch (req.method) {
      case "DELETE":
        await prisma.shareLink.delete({
          where: {
            secret: shareLink.secret,
          },
        });
        return {
          message: "Sharelink deleted",
        };

      default:
        throw new MethodNotAllowed();
    }
  },
  withDB,
  withCurrentUser
);
