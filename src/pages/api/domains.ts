import { resolve4 } from "dns/promises";
import formidable from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import PQueue from "p-queue";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withSession } from "../../decorators/withSession";
import { handleNewFQDN } from "../../services/domainService";
import { filterToIpInNetwork } from "../../services/ipService";
import { getLogger } from "../../services/logger";
import { timeout } from "../../utils/common";
import { stream2buffer } from "../../utils/server";

const logger = getLogger(__filename);

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [db, session]) => {
    const requestId = req.headers["x-request-id"] as string;
    if (!session) {
      res.status(401).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    // check if the user uploads a file or only inputs a single domain.
    if (req.headers["content-type"]?.includes("application/json")) {
      // the user does only send a single domain.

      const { domain }: { domain: string } = JSON.parse(
        (await stream2buffer(req)).toString()
      );

      const ips = await resolve4(domain);
      const ipsInSubnet = filterToIpInNetwork(ips, session.user.networks);
      if (ipsInSubnet.length === 0) {
        logger.warn(
          `Domain ${domain} does not have an ip address in the users subnet. Skipping.`
        );
        res.status(400).send({ success: false, reason: "not_in_subnet" });
        return;
      }

      const { fqdn } = await handleNewFQDN(domain, ipsInSubnet[0], db.Domain);
      // the domain will automatically be inspected.
      return res.send({ success: true, fqdn });
    }

    const data = await new Promise<{ files: formidable.Files }>(
      (resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ files });
        });
      }
    );

    const files = await Promise.all(
      Object.entries(data.files)
        .map(([_, value]) => {
          return value;
        })
        .flat()
        // validate for text files.
        .filter((file) => file.mimetype?.includes("text"))
        .map(async (file) => {
          // open the file.
          const handle = await fs.open(file.filepath);
          // read the file
          const data = await handle.readFile();
          // close the file
          await handle.close();
          // read the file as csv.
          return data.toString();
        })
    );
    const entries = files.map((file) => file.split("\n")).flat();

    const promiseQueue = new PQueue({ concurrency: 5, timeout: 5_000 });
    promiseQueue
      .addAll(
        entries
          .filter((domain) => domain.length > 0)
          .map((domain) => {
            return async () => {
              try {
                const ips = await timeout(resolve4(domain));
                const ipsInSubnet = filterToIpInNetwork(
                  ips,
                  session.user.networks
                );
                if (ipsInSubnet.length === 0) {
                  logger.warn(
                    {
                      requestId,
                      userId: session.user.id,
                    },
                    `Domain ${domain} does not have an ip address in the users subnet. Skipping.`
                  );
                  return null;
                }

                return {
                  domain,
                  ipAddress: ipsInSubnet[0],
                };
              } catch (err: any) {
                return null;
              }
            };
          })
      )
      .then(async (domainAndIp) => {
        const filteredDomains = domainAndIp.filter(
          (domain): domain is { domain: string; ipAddress: string } => {
            return domain !== null;
          }
        );
        await promiseQueue.addAll(
          filteredDomains.map(({ domain: domain_1, ipAddress }) => {
            return async () => {
              try {
                await handleNewFQDN(domain_1, ipAddress, db.Domain);
              } catch (err: any) {
                logger.error(
                  { err: err?.message },
                  `Error while importing domain from file: ${domain_1}`
                );
              }
            };
          })
        );
        logger.info(
          {
            requestId,
            userId: session.user.id,
          },
          `Finished importing domains from file. (${filteredDomains.length}/${entries.length})`
        );
      });

    res.status(200).end();
  },
  withDB,
  withSession
);
