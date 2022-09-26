// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { resolve6 } from "dns/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import ContentInspector from "../../inspection/content/ContentInspector";
import CookieInspector from "../../inspection/cookie/CookieInspector";
import DomainInspector from "../../inspection/domain/DomainInspector";
import HeaderInspector from "../../inspection/header/HeaderInspector";
import HttpInspector from "../../inspection/http/HttpInspector";
import { InspectionResult, InspectionType } from "../../inspection/Inspector";
import NetworkInspector from "../../inspection/network/NetworkInspector";
import OrganizationalInspector from "../../inspection/organizational/OrganizationalInspector";
import { getLogger } from "../../utils/logger";

import { sanitizeFQDN } from "../../utils/santize";

const logger = getLogger(__filename);

const httpInspector = new HttpInspector(fetch);
const headerInspector = new HeaderInspector(fetch);
const organizationalInspector = new OrganizationalInspector(fetch);
const domainInspector = new DomainInspector(fetch);
const networkInspector = new NetworkInspector({
  resolve6,
});
const contentInspector = new ContentInspector(fetch);
const cookieInspector = new CookieInspector(fetch);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Partial<{ [key in InspectionType]: InspectionResult }> | { error: string }
  >
) {
  const start = performance.now();
  logger.debug(`received request to scan site: ${req.query.site}`);
  const siteToScan = sanitizeFQDN(req.query.site);
  logger.debug(`sanitized site to scan: ${siteToScan}`);
  if (!siteToScan) {
    logger.child({ duration: performance.now() - start })
      .error(`invalid site to scan: ${req.query.site} - provide a valid fully qualified domain name as query parameter: 
    ?site=example.com`);
    return res.status(400).json({
      error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${req.query.site}`,
    });
  }
  try {
    const [
      result,
      headerResult,
      organizationalResult,
      domainResult,
      networkResult,
      contentResults,
      cookieResults,
    ] = await Promise.all([
      httpInspector.inspect(siteToScan),
      headerInspector.inspect(siteToScan),
      organizationalInspector.inspect(siteToScan),
      domainInspector.inspect(siteToScan),
      networkInspector.inspect(siteToScan),
      contentInspector.inspect(siteToScan),
      cookieInspector.inspect(siteToScan),
    ]);
    logger
      .child({ duration: performance.now() - start })
      .info(`successfully scanned site: ${siteToScan}`);
    return res.json({
      ...result,
      ...headerResult,
      ...organizationalResult,
      ...domainResult,
      ...networkResult,
      ...contentResults,
      ...cookieResults,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "fetch failed") {
      logger
        .child({ duration: performance.now() - start })
        .error({ err: error }, `failed to fetch site: ${siteToScan}`);
      return res.status(400).json({
        error:
          "Invalid site provided. Please provide a valid fully qualified domain name as site query parameter. Example: ?site=example.com",
      });
    }

    logger
      .child({ duration: performance.now() - start })
      .error({ err: error }, "unknown error happened while scanning site");
    return res.status(500).json({ error: "Unknown error" });
  }
}
