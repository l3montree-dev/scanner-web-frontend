import { PrismaClient, User } from "@prisma/client";
import formidable from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import PQueue from "p-queue";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withSession } from "../../decorators/withSession";
import ForbiddenException from "../../errors/ForbiddenException";
import MethodNotAllowed from "../../errors/MethodNotAllowed";
import { domainService } from "../../services/domainService";

import { getLogger } from "../../services/logger";
import { statService } from "../../services/statService";
import { ISession } from "../../types";
import { splitLineBreak } from "../../utils/common";
import { stream2buffer } from "../../utils/server";

const logger = getLogger(__filename);

const deleteTag = async (
  tagTitle: string,
  user: User,
  prisma: PrismaClient
) => {
  return prisma.tag.delete({
    where: {
      title_userId: {
        title: tagTitle,
        userId: user.id,
      },
    },
  });
};

const handleDelete = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: ISession,
  prisma: PrismaClient
) => {
  const requestId = req.headers["x-request-id"] as string;
  const { domains } = JSON.parse((await stream2buffer(req)).toString());
  await deleteTag(domains, session.user, prisma);
  statService.generateStatsForUser(session.user, prisma, true).then(() => {
    logger.info(
      { userId: session.user.id, requestId },
      `regenerated stats for user: ${session.user.id}`
    );
  });
  return res.send({ success: true });
};

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: ISession,
  prisma: PrismaClient
) => {
  const requestId = req.headers["x-request-id"] as string;
  // check if the user uploads a file or only inputs a single domain.

  // the user does only send a single domain.

  const tag: { title: string; color: string } = req.body;

  const d = await prisma.tag.create({
    data: {
      title: tag.title,
      color: tag.color,
      user: {
        connect: {
          id: session.user.id,
        },
      },
      domains: {
        connect: {
          fqdn: req.body.domainId,
        },
      },
    },
  });

  // force the regeneration of all stats
  statService.generateStatsForUser(session.user, prisma, true).then(() => {
    logger.info(
      { requestId, userId: session.user.id },
      `domain import - stats regenerated.`
    );
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
  withSession
);
