import { createServer } from "http";
import next from "next";
import { startMonitoring } from "./src/leaderelection/ozgsecMonitoring";
import { openSSL } from "./src/services/openssl";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const server = createServer(handle);

// start the next js app.
app.prepare().then(() => {
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

startMonitoring();

(async function () {
  try {
    const result = await openSSL([
      "s_client",
      "-connect",
      "test-server:443",
      "-ssl3",
    ]);
    console.log("res", result);
  } catch (e) {
    console.log("err", e);
  }
})();
