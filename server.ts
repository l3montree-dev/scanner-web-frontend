import { createServer } from "http";
import next from "next";
import { rabbitMQRPCClient } from "./src/services/rabbitmqClient";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const server = createServer(handle);

// start the next js app.
app
  .prepare()
  .then(() => {
    rabbitMQRPCClient.listenToReplyQueue();
    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
