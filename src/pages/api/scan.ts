// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { inspectRPC } from "../../inspection/inspect";
import { domainService } from "../../services/domainService";
import { getLogger } from "../../services/logger";
import {
  reportService,
  scanResult2DomainDetails,
} from "../../services/reportService";
import {
  defaultOnError,
  isScanError,
  neverThrow,
  sanitizeFQDN,
  staticSecrets,
  timeout,
} from "../../utils/common";
import { DTO, toDTO } from "../../utils/server";
import { DetailedDomain } from "../../types";
import CircuitBreaker from "../../utils/CircuitBreaker";

const logger = getLogger(__filename);

const scanCB = new CircuitBreaker();
export default decorate(
  async (
    req: NextApiRequest,
    res: NextApiResponse<DTO<DetailedDomain> | { error: string; fqdn: string }>,
    [prisma]
  ) => {
    const start = Date.now();

    if (!staticSecrets.includes(req.query.s as string)) {
      logger.error(`invalid secret provided: ${req.query.s}`);
      return res.status(403).json({
        error: "Invalid secret provided",
        fqdn: req.query.site as string,
      });
    }

    // check if the client does provide a request id.
    // if so, use this - otherwise generate a new one.
    const requestId =
      (req.headers["x-request-id"] as string | undefined) ?? randomUUID();

    logger.debug(
      { requestId },
      `received request to scan site: ${req.query.site}`
    );
    const siteToScan = sanitizeFQDN(req.query.site);
    logger.debug({ requestId }, `sanitized site to scan: ${siteToScan}`);
    // check if we were able to sanitize the site
    // if the requested site is not a valid fqdn, the function returns null
    if (!siteToScan) {
      logger.error(
        { requestId },
        `invalid site to scan: ${req.query.site} - provide a valid fully qualified domain name as query parameter: 
      ?site=example.com`
      );
      return res.status(400).json({
        error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${req.query.site}`,
        fqdn: req.query.site as string,
      });
    }

    if (req.query.refresh !== "true") {
      // check if we already have a report for this site
      const domain = toDTO(
        await neverThrow(
          prisma.domain.findFirst({
            where: {
              fqdn: siteToScan,
              lastScan: {
                // last hour
                gte: new Date(Date.now() - 1000 * 60 * 60 * 1).getTime(),
              },
              details: {
                not: Prisma.JsonNull,
              },
            },
          })
        )
      ) as DTO<DetailedDomain>;

      if (domain) {
        logger.info(
          { requestId },
          `found existing report for site: ${siteToScan} - returning existing report`
        );
        return res.status(200).json(domain);
      }
    }

    const result = await inspectRPC(requestId, siteToScan);

    if (isScanError(result)) {
      // do not monitor this domain if it does not exist yet - this means, that there is a user which scans the domain for the first time.
      // it is not necessary to do any re-scans.
      await neverThrow(
        scanCB.run(
          async () =>
            await timeout(domainService.handleDomainScanError(result, prisma))
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
      return res.status(422).json({
        error: result.result.error.code,
        fqdn: result.target,
      });
    } else {
      logger.info(
        { duration: Date.now() - start, requestId },
        `successfully scanned site: ${siteToScan}`
      );
      const domain = await defaultOnError(
        scanCB.run(async () =>
          timeout(reportService.handleNewScanReport(result, prisma))
        ),
        {
          fqdn: result.target,
          lastScan: result.timestamp,
          errorCount: 0,
          group: "",
          queued: false,
          createdAt: new Date(result.timestamp).toString(),
          updatedAt: new Date(result.timestamp).toString(),
          details: scanResult2DomainDetails(result),
        } as DTO<DetailedDomain>
      );
      return res.json(domain);
    }
  },
  withDB
);
