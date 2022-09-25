// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import DomainInspector from "../../inspection/domain/DomainInspector";
import HttpInspector from "../../inspection/http/HttpInspector";
import { InspectionResult, InspectionType } from "../../inspection/Inspector";
import NetworkInspector from "../../inspection/network/NetworkInspector";
import OrganizationalInspector from "../../inspection/organizational/OrganizationalInspector";
import { sanitizeFQDN } from "../../utils/santize";
import { resolve6 } from "dns";
import { promisify } from "util";

const httpInspector = new HttpInspector(fetch);
const organizationalInspector = new OrganizationalInspector(fetch);
const domainInspector = new DomainInspector(fetch);
const networkInspector = new NetworkInspector({
  resolve6: promisify(resolve6),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Partial<{ [key in InspectionType]: InspectionResult }> | { error: string }
  >
) {
  const siteToScan = sanitizeFQDN(req.query.site);
  if (!siteToScan) {
    return res.status(400).json({
      error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${req.query.site}`,
    });
  }
  try {
    const [result, organizationalResult, domainResult, networkResult] =
      await Promise.all([
        httpInspector.inspect(siteToScan),
        organizationalInspector.inspect(siteToScan),
        domainInspector.inspect(siteToScan),
        networkInspector.inspect(siteToScan),
      ]);
    return res.json({
      ...result,
      ...organizationalResult,
      ...domainResult,
      ...networkResult,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "fetch failed") {
      return res.status(400).json({
        error:
          "Invalid site provided. Please provide a valid fully qualified domain name as site query parameter. Example: ?site=example.com",
      });
    }
    console.error(error);
    return res.status(500).json({ error: "Unknown error" });
  }
}
