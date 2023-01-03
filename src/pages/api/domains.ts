import { resolve4, lookup } from "dns/promises";
import formidable from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import PQueue from "p-queue";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withSession } from "../../decorators/withSession";
import { domainService } from "../../services/domainService";
import { ipService } from "../../services/ipService";

import { getLogger } from "../../services/logger";
import { isAdmin } from "../../utils/common";
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
      const ipsInSubnet = ipService.filterToIpInNetwork(
        ips,
        session.user.networks
      );
      if (ipsInSubnet.length === 0) {
        logger.warn(
          `Domain ${domain} does not have an ip address in the users subnet. Skipping.`
        );
        res.status(400).send({ success: false, reason: "not_in_subnet" });
        return;
      }

      const { fqdn } = await domainService.handleNewFQDN(
        domain,
        ipsInSubnet[0],
        db.Domain
      );
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

    logger.info(
      { requestId, userId: session.user.id },
      `starting domain import of ${entries.length} domains.`
    );
    let count = 0;
    let imported = 0;
    promiseQueue.on("active", () => {
      count++;
      if (count % 100 === 0) {
        logger.info(
          {
            requestId,
            userId: session.user.id,
          },
          `Working on item #${count}.  Size: ${promiseQueue.size} Imported: ${imported}  Pending: ${promiseQueue.pending}`
        );
      }
    });

    promiseQueue
      .addAll(
        entries
          .filter((domain) => domain.length > 0)
          .map((domain) => {
            return async () => {
              try {
                const ip = (await lookup(domain, 4)).address;
                if (isAdmin(session) && ip) {
                  await domainService.handleNewFQDN(domain, ip, db.Domain);
                  imported++;
                  return;
                }
                const ipsInSubnet = ipService.filterToIpInNetwork(
                  [ip],
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
                  return;
                }

                await domainService.handleNewFQDN(
                  domain,
                  ipsInSubnet[0],
                  db.Domain
                );
                imported++;
              } catch (err: any) {
                return;
              }
            };
          })
      )
      .then(() => {
        logger.info(
          {
            requestId,
            userId: session.user.id,
          },
          `Finished importing domains from file. (${imported}/${entries.length})`
        );
      });
    res.status(200).end();
  },
  withDB,
  withSession
);
