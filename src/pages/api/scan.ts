// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Model } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { IReport } from "../../db/report";
import { withDB } from "../../decorators/withDB";
import { inspect } from "../../inspection/inspect";
import { InspectionResult, InspectionType } from "../../inspection/Inspector";
import { getLogger } from "../../services/logger";

import { sanitizeFQDN } from "../../utils/santize";

const logger = getLogger(__filename);

const handler = async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Partial<{ [key in InspectionType]: InspectionResult }> | { error: string }
  >,
  { Report }: { Report: Model<IReport> }
) {
  const start = Date.now();
  logger.debug(`received request to scan site: ${req.query.site}`);
  const siteToScan = sanitizeFQDN(req.query.site);
  logger.debug(`sanitized site to scan: ${siteToScan}`);
  // check if we were able to sanitize the site
  // if the requested site is not a valid fqdn, the function returns null
  if (!siteToScan) {
    logger.child({ duration: Date.now() - start })
      .error(`invalid site to scan: ${req.query.site} - provide a valid fully qualified domain name as query parameter: 
    ?site=example.com`);
    return res.status(400).json({
      error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${req.query.site}`,
    });
  }
  try {
    const result = await inspect(siteToScan);
    logger
      .child({ duration: Date.now() - start })
      .info(`successfully scanned site: ${siteToScan}`);
    const report = new Report({
      fqdn: siteToScan,
      duration: Date.now() - start,
      version: 1,
      result,
    });
    await report.save();
    return res.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "fetch failed") {
      logger
        .child({ duration: Date.now() - start })
        .error({ err: error }, `failed to fetch site: ${siteToScan}`);
      return res.status(400).json({
        error:
          "Invalid site provided. Please provide a valid fully qualified domain name as site query parameter. Example: ?site=example.com",
      });
    }

    logger
      .child({ duration: Date.now() - start })
      .error({ err: error }, "unknown error happened while scanning site");
    return res.status(500).json({ error: "Unknown error" });
  }
};

export default withDB(handler);
