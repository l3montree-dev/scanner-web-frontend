import PQueue from "p-queue";
import { inspectRPC } from "../../../../inspection/inspect";
import { targetService } from "../../../../services/targetService";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../db/connection";
import BadRequestException from "../../../../errors/BadRequestException";
import { authOptions } from "../../../../nextAuthOptions";
import { getLogger } from "../../../../services/logger";
import { reportService } from "../../../../services/reportService";
import {
  isScanError,
  neverThrow,
  sanitizeFQDN,
  splitLineBreak,
  timeout,
} from "../../../../utils/common";
import { getCurrentUser, toDTO } from "../../../../utils/server";

const logger = getLogger(__filename);

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser(authOptions);
  const requestId = req.headers.get("x-request-id") as string;
  // check if the user uploads a file or only inputs a single domain.
  if (req.headers.get("content-type")?.includes("application/json")) {
    // the user does only send a single domain.

    const { target }: { target: string } = await req.json();

    const sanitized = sanitizeFQDN(target);
    if (!sanitized) {
      throw new BadRequestException();
    }

    const result = await inspectRPC(requestId, sanitized);
    if (isScanError(result)) {
      logger.error(
        { requestId, userId: currentUser.id },
        `target import - error while scanning domain: ${sanitized}`
      );
      await neverThrow(
        timeout(targetService.handleTargetScanError(result, prisma))
      );

      throw new BadRequestException();
    }

    await targetService.handleNewTarget(
      { uri: sanitized, queued: true },
      prisma,
      currentUser
    );

    const res = await reportService.handleNewScanReport(result, prisma);

    return NextResponse.json(toDTO(res), { status: 201 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  const fileText = await Promise.all(
    files
      // validate for text files.
      .filter((file) => file.type?.includes("text"))
      .map(async (file) => {
        // open the file.
        return file.text();
      })
  );
  const entries = fileText.map((file) => splitLineBreak(file)).flat();

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

  return NextResponse.json({
    success: true,
  });
}
