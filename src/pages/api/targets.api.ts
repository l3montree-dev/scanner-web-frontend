import { PrismaClient, User } from "@prisma/client";
import formidable from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import PQueue from "p-queue";
import { decorate, DecoratedHandler } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import MethodNotAllowed from "../../errors/MethodNotAllowed";
import { inspectRPC } from "../../inspection/inspect";
import { targetService } from "../../services/targetService";

import { withCurrentUser } from "../../decorators/withCurrentUser";
import BadRequestException from "../../errors/BadRequestException";
import { getLogger } from "../../services/logger";
import { reportService } from "../../services/reportService";
import {
  isScanError,
  neverThrow,
  sanitizeFQDN,
  splitLineBreak,
  timeout,
} from "../../utils/common";
import { stream2buffer, toDTO } from "../../utils/server";
import { Collection } from "victory";

const logger = getLogger(__filename);

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const deleteTargetRelation = async (
  uris: string[],
  user: User,
  prisma: PrismaClient
) => {
  if (uris.length === 0) {
    return;
  }
  // delete it from all collection where this user is owner of or its his default collection.
  return prisma.targetCollectionRelation.deleteMany({
    where: {
      OR: [
        {
          uri: {
            in: uris,
          },
          collection: {
            ownerId: user.id,
          },
        },
        {
          uri: {
            in: uris,
          },
          collectionId: user.defaultCollectionId,
        },
      ],
    },
  });
};

const handleDelete = async (
  req: NextApiRequest,
  currentUser: User,
  prisma: PrismaClient
) => {
  const { targets } = JSON.parse((await stream2buffer(req)).toString());
  await deleteTargetRelation(targets, currentUser, prisma);
  return {
    success: true,
  };
};

const handlePost = async (
  req: NextApiRequest,
  currentUser: User,
  prisma: PrismaClient
) => {
  const requestId = req.headers["x-request-id"] as string;
  // check if the user uploads a file or only inputs a single domain.
  if (req.headers["content-type"]?.includes("application/json")) {
    // the user does only send a single domain.

    const { target }: { target: string } = JSON.parse(
      (await stream2buffer(req)).toString()
    );

    const sanitized = sanitizeFQDN(target);
    if (!sanitized) {
      throw new BadRequestException();
    }

    const d = await targetService.handleNewTarget(
      { uri: sanitized, queued: true },
      prisma,
      currentUser
    );

    const result = await inspectRPC(requestId, d.uri);
    if (isScanError(result)) {
      logger.error(
        { requestId, userId: currentUser.id },
        `target import - error while scanning domain: ${d.uri}`
      );
      await neverThrow(
        timeout(targetService.handleTargetScanError(result, prisma))
      );

      return toDTO(d);
    }

    const res = await reportService.handleNewScanReport(result, prisma);

    return toDTO(res);
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
    { requestId, userId: currentUser.id },
    `starting import of ${entries.length} targets.`
  );
  let count = 0;
  let imported = 0;
  promiseQueue.on("active", () => {
    count++;
    if (count % 100 === 0) {
      logger.info(
        {
          requestId,
          userId: currentUser.id,
        },
        `Working on item #${count}.  Size: ${promiseQueue.size} Imported: ${imported}  Pending: ${promiseQueue.pending}`
      );
    }
  });

  promiseQueue.addAll(
    entries
      .map((domain) => sanitizeFQDN(domain))
      .filter(
        (domain): domain is string => domain !== null && domain.length > 0
      )
      .map((domain) => {
        return async () => {
          try {
            await targetService.handleNewTarget(
              { uri: domain, queued: true },
              prisma,
              currentUser
            );
            await inspectRPC(requestId, domain);
            imported++;
          } catch (err: any) {
            return;
          }
        };
      })
  );

  return {
    success: true,
  };
};

// exporting just for testing purposes.
export const handler: DecoratedHandler<[PrismaClient, User]> = async (
  req: NextApiRequest,
  res: NextApiResponse,
  [prisma, currentUser]
) => {
  switch (req.method) {
    case "DELETE":
      return handleDelete(req, currentUser, prisma);
    case "POST":
      return handlePost(req, currentUser, prisma);
    default:
      throw new MethodNotAllowed();
  }
};

export default decorate(handler, withDB, withCurrentUser);
