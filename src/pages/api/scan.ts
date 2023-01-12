// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { Prisma } from "@prisma/client";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { inspectRPC } from "../../inspection/inspect";
import { domainService } from "../../services/domainService";
import { getLogger } from "../../services/logger";
import { reportService } from "../../services/reportService";
import { DetailedDomainWithScanResult } from "../../types";
import { isScanError, sanitizeFQDN } from "../../utils/common";
import { DTO, toDTO } from "../../utils/server";

const logger = getLogger(__filename);

export default decorate(
  async (
    req: NextApiRequest,
    res: NextApiResponse<
      DTO<DetailedDomainWithScanResult> | { error: string; fqdn: string }
    >,
    [prisma]
  ) => {
    const start = Date.now();

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
        await prisma.domain.findFirst({
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
          include: {
            scanReports: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
          take: 1,
        })
      );
      if (domain) {
        logger.info(
          { requestId },
          `found existing report for site: ${siteToScan} - returning existing report`
        );

        const { scanReports, ...domainWithoutScanReports } = domain;
        return res.status(200).json({
          ...domainWithoutScanReports,
          scanReport: scanReports[0],
        });
      }
    }

    const result = await inspectRPC(requestId, siteToScan);

    if (isScanError(result)) {
      if (result.result.error === "fetch failed") {
        logger.error(
          { err: result.result.error, duration: Date.now() - start, requestId },
          `failed to fetch site: ${siteToScan}`
        );
        return res.status(400).json({
          error:
            "Invalid site provided. Please provide a valid fully qualified domain name as site query parameter. Example: ?site=example.com",
          fqdn: result.fqdn,
        });
      } else {
        // do not monitor this domain if it does not exist yet - this means, that there is a user which scans the domain for the first time.
        // it is not necessary to do any re-scans.
        await domainService.handleDomainScanError(result, false, prisma);
        logger.error(
          {
            err: result.result.error.message,
            duration: Date.now() - start,
            requestId,
          },
          `failed to scan site: ${siteToScan}`
        );
        return res.status(500).json({
          error: "Error happened...",
          fqdn: result.fqdn,
        });
      }
    } else {
      logger.info(
        { duration: Date.now() - start, requestId },
        `successfully scanned site: ${siteToScan}`
      );
      const domain = await reportService.handleNewScanReport(
        result,
        false,
        prisma
      );
      return res.json(domain);
    }
  },
  withDB
);
