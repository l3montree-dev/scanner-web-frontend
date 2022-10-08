// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { resolve6 } from "dns/promises";
import { Model } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import { withDB } from "../../decorators/withDB";
import CertificateInspector from "../../inspection/certificate/CertificateInspector";
import ContentInspector from "../../inspection/content/ContentInspector";
import CookieInspector from "../../inspection/cookie/CookieInspector";
import DomainInspector from "../../inspection/domain/DomainInspector";
import HeaderInspector from "../../inspection/header/HeaderInspector";
import HttpInspector from "../../inspection/http/HttpInspector";
import { InspectionResult, InspectionType } from "../../inspection/Inspector";
import NetworkInspector from "../../inspection/network/NetworkInspector";
import OrganizationalInspector from "../../inspection/organizational/OrganizationalInspector";
import TLSInspector from "../../inspection/tls/TLSInspector";
import { fetchWithTimeout } from "../../services/api";
import { getLogger } from "../../services/logger";

import { sanitizeFQDN } from "../../utils/santize";

const logger = getLogger(__filename);

const fetchClient = fetchWithTimeout(3_000);
const httpInspector = new HttpInspector(fetchClient);
const headerInspector = new HeaderInspector(fetchClient);
const organizationalInspector = new OrganizationalInspector(fetchClient);
const domainInspector = new DomainInspector(fetchClient);
const networkInspector = new NetworkInspector({
  resolve6,
});
const contentInspector = new ContentInspector(fetchClient);
const cookieInspector = new CookieInspector(fetchClient);
const tlsInspector = new TLSInspector();
const certificateInspector = new CertificateInspector();

const handler = async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Partial<{ [key in InspectionType]: InspectionResult }> | { error: string }
  >,
  { Report }: { Report: Model<any> }
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
      httpResult,
      headerResult,
      organizationalResult,
      domainResult,
      networkResult,
      contentResults,
      cookieResults,
      tlsResults,
      certificateResults,
    ] = await Promise.all([
      httpInspector.inspect(siteToScan),
      headerInspector.inspect(siteToScan),
      organizationalInspector.inspect(siteToScan),
      domainInspector.inspect(siteToScan),
      networkInspector.inspect(siteToScan),
      contentInspector.inspect(siteToScan),
      cookieInspector.inspect(siteToScan),
      tlsInspector.inspect(siteToScan),
      certificateInspector.inspect(siteToScan),
    ]);
    logger
      .child({ duration: performance.now() - start })
      .info(`successfully scanned site: ${siteToScan}`);
    const result = {
      ...httpResult,
      ...headerResult,
      ...organizationalResult,
      ...domainResult,
      ...networkResult,
      ...contentResults,
      ...cookieResults,
      ...tlsResults,
      ...certificateResults,
    };
    const report = new Report(result);
    await report.save();
    return res.json(result);
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
};

export default withDB(handler);
