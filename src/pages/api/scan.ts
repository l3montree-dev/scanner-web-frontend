// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { randomUUID } from "crypto";
import { Model } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

import { toDTO } from "../../db/models";
import { tryDB } from "../../decorators/tryDB";
import { inspectRPC } from "../../inspection/inspect";
import { getLogger } from "../../services/logger";
import { handleNewScanReport } from "../../services/reportService";
import { IReport } from "../../types";
import { sanitizeFQDN } from "../../utils/common";
import ip from "ip";
import { decorate } from "../../decorators/decorate";

const logger = getLogger(__filename);

export default decorate(
  async (
    req: NextApiRequest,
    res: NextApiResponse<IReport | { error: string }>,
    [db]
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
      });
    }

    if (req.query.refresh !== "true") {
      // check if we already have a report for this site
      const existingReport = await db.Report?.findOne(
        {
          fqdn: siteToScan,
          lastScan: {
            // last hour
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 1),
          },
        },
        null,
        {
          sort: {
            lastScan: -1,
          },
        }
      ).lean();
      if (existingReport) {
        logger.info(
          { requestId },
          `found existing report for site: ${siteToScan} - returning existing report`
        );
        return res.status(200).json(toDTO(existingReport));
      }
    }

    try {
      const result = await inspectRPC(requestId, siteToScan);

      logger.info(
        { duration: Date.now() - start, requestId },
        `successfully scanned site: ${siteToScan}`
      );

      const data: IReport = {
        ...result,
        duration: Date.now() - start,
        version: 1,
        iconBase64: result.icon,
        lastScan: result.timestamp,
        validFrom: result.timestamp,
        createdAt: result.timestamp,
        updatedAt: result.timestamp,
        automated: false,
        ipV4AddressNumber: ip.toLong(result.ipAddress),
      };

      if (db.Report) {
        return res.json(toDTO(await handleNewScanReport(data, db.Report)));
      } else {
        return res.json(data);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "fetch failed") {
        logger.error(
          { err: error.message, duration: Date.now() - start, requestId },
          `failed to fetch site: ${siteToScan}`
        );
        return res.status(400).json({
          error:
            "Invalid site provided. Please provide a valid fully qualified domain name as site query parameter. Example: ?site=example.com",
        });
      } else if (error instanceof Error) {
        logger.error(
          { err: error.message, duration: Date.now() - start, requestId },
          `timeout while scanning site: ${siteToScan}`
        );
        return res.status(500).json({ error: "Error happened..." });
      }
      logger.error(
        { duration: Date.now() - start, requestId },
        "unknown error happened while scanning site"
      );
      return res.status(500).json({ error: "Unknown error" });
    }
  },
  tryDB
);
