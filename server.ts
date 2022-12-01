import { createServer } from "http";
import next from "next";
import getConnection from "./src/db/connection";
import { ICompressedReport } from "./src/db/report";
import { getLogger } from "./src/services/logger";
import { rabbitMQClient } from "./src/services/rabbitmqClient";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const server = createServer(handle);

const logger = getLogger(__filename);
getConnection()
  .then((connection) => {
    rabbitMQClient.subscribe("scan-response", async (msg) => {
      const content = JSON.parse(msg.content.toString()).data as
        | {
            results: ICompressedReport;
            fqdn: string;
          }
        | { fqdn: string; error: any };

      if ("error" in content) {
        logger.error({ fqdn: content.fqdn }, content.error);
        return;
      }

      const report = new connection.models.CompressedReport({
        fqdn: content.fqdn,
        result: content.results,
        version: 1,
      });
      try {
        await report.save();
      } catch (e) {
        // always ack the message - catch the error.
        logger.error(e);
      }
    });
  })
  .catch((err) => {
    logger.error(err);
  });

// start the next js app.
app
  .prepare()
  .then(() => {
    server.listen(port, () => {
      logger.info(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    logger.error(err);
  });
