import { randomUUID } from "crypto";

import { Target } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../db/connection";
import { authOptions } from "../../../nextAuthOptions";
import { getLogger } from "../../../services/logger";
import CircuitBreaker from "../../../utils/CircuitBreaker";

import { inspectRPC } from "../../../inspection/inspect";
import { monitoringService } from "../../../services/monitoringService";
import {
  reportService,
  scanResult2TargetDetails,
} from "../../../services/reportService";
import { targetService } from "../../../services/targetService";
import { DetailsJSON } from "../../../types";
import {
  defaultOnError,
  isScanError,
  neverThrow,
  sanitizeFQDN,
  timeout,
} from "../../../utils/common";
import { DTO, getServerSession, toDTO } from "../../../utils/server";
import { staticSecrets } from "../../../utils/staticSecrets";

const logger = getLogger(__filename);

const scanCB = new CircuitBreaker();

// exporting for testing purposes
export async function GET(req: NextRequest) {
  const start = Date.now();
  const secret = req.nextUrl.searchParams.get("s");
  const session = await getServerSession(authOptions);
  const site = req.nextUrl.searchParams.get("site");
  const refresh = req.nextUrl.searchParams.get("refresh");

  if (!session && (!secret || !staticSecrets[secret])) {
    logger.error(`invalid secret provided: ${secret}`);
    return NextResponse.json(
      {
        error: "Invalid secret provided",
        uri: site as string,
      },
      { status: 401 }
    );
  }

  // check if the client does provide a request id.
  // if so, use this - otherwise generate a new one.
  const requestId =
    (req.headers.get("x-request-id") as string | undefined) ?? randomUUID();

  logger.debug({ requestId }, `received request to scan site: ${site}`);
  const siteToScan = sanitizeFQDN(site);
  logger.debug({ requestId }, `sanitized site to scan: ${siteToScan}`);
  // check if we were able to sanitize the site
  // if the requested site is not a valid uri, the function returns null
  if (!siteToScan) {
    logger.error({ requestId }, `invalid site to scan: ${site}`);
    return NextResponse.json(
      {
        error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${site}`,
        uri: site as string,
      },
      { status: 400 }
    );
  }

  monitoringService.trackApiCall(
    siteToScan,
    (secret as string) || session?.user?.id
  );

  if (refresh !== "true") {
    // check if we already have a report for this site
    const details = toDTO(
      await neverThrow(
        prisma.lastScanDetails.findFirst({
          include: {
            target: true,
          },
          where: {
            uri: siteToScan,
            updatedAt: {
              // last hour
              gte: new Date(Date.now() - 1000 * 60 * 60 * 1),
            },
          },
        })
      )
    ) as DTO<
      | ({ details: DetailsJSON } & {
          target: Omit<Target, "lastScan"> & { lastScan: number };
        })
      | null
    >;

    if (details) {
      logger.info(
        { requestId },
        `found existing report for site: ${siteToScan} - returning existing report`
      );

      const { target, ...rest } = details;

      return NextResponse.json({
        ...target,
        details: rest.details,
      });
    }
  }

  const result = await inspectRPC(requestId, siteToScan);

  if (isScanError(result)) {
    await neverThrow(
      scanCB.run(
        async () =>
          await timeout(targetService.handleTargetScanError(result, prisma))
      )
    );
    logger.error(
      {
        err: result.result.error.message,
        duration: Date.now() - start,
        requestId,
      },
      `failed to scan site: ${siteToScan}`
    );
    return NextResponse.json(
      {
        error: result.result.error.code,
        uri: result.target,
      },
      { status: 422 }
    );
  } else {
    logger.info(
      { duration: Date.now() - start, requestId },
      `successfully scanned site: ${siteToScan}`
    );
    const target = await defaultOnError(
      scanCB.run(async () =>
        timeout(reportService.handleNewScanReport(result, prisma))
      ),
      {
        uri: result.target,
        lastScan: result.timestamp,
        hostname: "",
        errorCount: 0,
        number: 0,
        queued: false,
        createdAt: new Date(result.timestamp).toString(),
        updatedAt: new Date(result.timestamp).toString(),
        details: scanResult2TargetDetails(result),
      }
    );
    return NextResponse.json(target);
  }
}
