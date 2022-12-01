// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { inspect } from "../../inspection/inspect";
import { sanitizeFQDN } from "../../utils/santize";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // check if the client does provide a request id.
  // if so, use this - otherwise generate a new one.
  const requestId =
    (req.headers["x-request-id"] as string | undefined) ?? randomUUID();

  const siteToScan = sanitizeFQDN(req.query.site);
  if (!siteToScan) {
    return res.status(400).json({
      error: `Missing site to scan or not a valid fully qualified domain name. Please provide the site you would like to scan using the site query parameter. Provided value: ?site=${req.query.site}`,
    });
  }

  await inspect(requestId, siteToScan);
  res.json({ success: true });
}
