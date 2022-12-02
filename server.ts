import { createServer } from "http";
import next from "next";
import getConnection from "./src/db/connection";
import { getLogger } from "./src/services/logger";
import {
  rabbitMQClient,
  rabbitMQRPCClient,
} from "./src/services/rabbitmqClient";
import { Server } from "socket.io";
import { isProgressMessage } from "./src/utils/common";
import {
  ICompressedReport,
  IIpLookupProgressUpdate,
  IIpLookupReport,
} from "./src/types";
const logger = getLogger(__filename);

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const server = createServer(handle);

const io = new Server(server);
io.on("connection", (socket) => {
  socket.on("ip-lookup", (msg) => {
    const { cidr, requestId } = msg;
    if (!cidr || !requestId) {
      socket.emit("ip-lookup", {
        error: "CIDR and requestId is required",
        requestId,
        cidr,
      });
      return;
    }
    logger.info({ requestId, cidr }, `received request for ${cidr}`);
    rabbitMQRPCClient.stream(
      "ip-lookup",
      {
        cidr,
        sendProgress: true,
      },
      {
        messageId: requestId,
      },
      (cancelFn, msg: IIpLookupProgressUpdate | IIpLookupReport) => {
        // order the result list by IP address
        msg.results = Object.fromEntries(
          Object.entries(msg.results).sort(([a], [b]) => {
            return +a.replace(".", "") - +b.replace(".", "");
          })
        );

        logger.info(
          { requestId, cidr },
          `sending progress update for ${cidr}, queued: ${
            "queued" in msg ? msg.queued : 0
          }`
        );
        socket.emit("ip-lookup", { ...msg, requestId, cidr });
        if (!isProgressMessage(msg)) {
          // the last message was received - stop the stream
          cancelFn();
        }
      }
    );
  });
});

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
