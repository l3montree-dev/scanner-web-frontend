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
import { inspectRPC } from "../../inspection/inspect";
import { targetService } from "../../services/targetService";

import { getLogger } from "../../services/logger";
import { statService } from "../../services/statService";
import { ISession } from "../../types";
import { sanitizeFQDN, splitLineBreak } from "../../utils/common";
import { stream2buffer } from "../../utils/server";

const logger = getLogger(__filename);

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const deleteDomainRelation = async (
  uris: string[],
  user: User,
  prisma: PrismaClient
) => {
  return prisma.userDomainRelation.deleteMany({
    where: {
      uri: {
        in: uris,
      },
      userId: user.id,
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
  await deleteDomainRelation(domains, session.user, prisma);
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
  if (req.headers["content-type"]?.includes("application/json")) {
    // the user does only send a single domain.

    const { domain }: { domain: string } = JSON.parse(
      (await stream2buffer(req)).toString()
    );

    const sanitized = sanitizeFQDN(domain);
    if (!sanitized) {
      return res.status(400).send({ error: "invalid domain" });
    }

    const d = await targetService.handleNewDomain(
      { uri: sanitized, queued: true },
      prisma,
      session.user
    );

    await inspectRPC(requestId, d.uri);
    // force the regeneration of all stats
    statService.generateStatsForUser(session.user, prisma, true).then(() => {
      logger.info(
        { requestId, userId: session.user.id },
        `domain import - stats regenerated.`
      );
    });
    return res.send(d);
  }

  // the user uploads a file with domains.
  const data = await new Promise<{ files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ files });
      });
    }
  );

  const files = await Promise.all(
    Object.entries(data.files)
      .map(([_, value]) => {
        return value;
      })
      .flat()
      // validate for text files.
      .filter((file) => file.mimetype?.includes("text"))
      .map(async (file) => {
        // open the file.
        const handle = await fs.open(file.filepath);
        // read the file
        const data = await handle.readFile();
        // close the file
        await handle.close();
        // read the file as csv.
        return data.toString();
      })
  );
  const entries = files.map((file) => splitLineBreak(file)).flat();

  const promiseQueue = new PQueue({ concurrency: 5, timeout: 5_000 });

  logger.info(
    { requestId, userId: session.user.id },
    `starting domain import of ${entries.length} domains.`
  );
  let count = 0;
  let imported = 0;
  promiseQueue.on("active", () => {
    count++;
    if (count % 100 === 0) {
      logger.info(
        {
          requestId,
          userId: session.user.id,
        },
        `Working on item #${count}.  Size: ${promiseQueue.size} Imported: ${imported}  Pending: ${promiseQueue.pending}`
      );
    }
  });

  promiseQueue
    .addAll(
      entries
        .map((domain) => sanitizeFQDN(domain))
        .filter(
          (domain): domain is string => domain !== null && domain.length > 0
        )
        .map((domain) => {
          return async () => {
            try {
              await targetService.handleNewDomain(
                { uri: domain, queued: true },
                prisma,
                session.user
              );
              await inspectRPC(requestId, domain);
              imported++;
            } catch (err: any) {
              return;
            }
          };
        })
    )
    .then(() => {
      logger.info(
        {
          requestId,
          userId: session.user.id,
        },
        `Finished importing domains from file. (${imported}/${entries.length})`
      );
      statService.generateStatsForUser(session.user, prisma, true).then(() => {
        logger.info(
          { requestId, userId: session.user.id },
          `domain import - stats regenerated.`
        );
      });
    });
  res.status(200).end();
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
