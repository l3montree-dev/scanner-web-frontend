import { NextApiRequest, NextApiResponse } from "next";
import {
  startScanResponseLoop,
  startSocketIOServer,
} from "../../services/serverCtl";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // use the health route handler as initial setup as well.
  // otherwise we have to create a custom server for NextJS, which in turn would
  // make it much harder to use ESM only modules.
  // @ts-expect-error
  startSocketIOServer(res.socket.server);
  startScanResponseLoop();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ success: true }));
}
