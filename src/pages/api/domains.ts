import formidable from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withSession } from "../../decorators/withSession";
import { inspect } from "../../inspection/inspect";
import { handleNewFQDN } from "../../services/domainService";
import { getLogger } from "../../services/logger";
import { promiseExecutor } from "../../utils/server";

const logger = getLogger(__filename);

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [db, session]) => {
    if (!session) {
      res.status(401).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).end();
      return;
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

    const csvs = await Promise.all(
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
    const promiseFactories = csvs
      .map((csv) => {
        return csv.split("\n");
      })
      .flat()
      .filter((domain) => domain.length > 0)
      .map((domain, i) => {
        return async () => {
          console.log(i);
          try {
            const { fqdn } = await handleNewFQDN(domain, db.Domain);
            await inspect("csv-import", fqdn);
          } catch (err: any) {
            logger.error(
              { err: err?.message },
              `Error while importing domain from csv: ${domain}`
            );
          }
        };
      });

    promiseExecutor(promiseFactories, 1);

    res.status(200).end();
  },
  withDB,
  withSession
);
