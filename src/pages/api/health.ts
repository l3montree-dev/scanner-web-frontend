import { NextApiRequest, NextApiResponse } from "next";
import { serverCtrl } from "../../services/serverCtrl";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // use the health route handler as initial setup as well.
  // otherwise we have to create a custom server for NextJS, which in turn would
  // make it much harder to use ESM only modules.
  // @ts-expect-error
  serverCtrl.startSocketIOServer(res.socket.server);
  serverCtrl.startScanResponseLoop();
  serverCtrl.startLookupResponseLoop();
  serverCtrl.startScanLoop();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ success: true }));
}
