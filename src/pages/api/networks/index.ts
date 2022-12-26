import { NextApiRequest, NextApiResponse } from "next";
import { ModelsType } from "../../../db/models";
import { decorate } from "../../../decorators/decorate";
import { withDB } from "../../../decorators/withDB";
import { withSession } from "../../../decorators/withSession";
import { lookupNetwork } from "../../../services/ipService";
import { createNewNetworks } from "../../../services/networkService";
import { isAdmin, parseNetworkString } from "../../../utils/common";

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse,
  db: ModelsType
) => {
  const requestId = req.headers["x-request-id"] as string;
  let networks: string[] = JSON.parse(req.body);
  res.setHeader("Content-Type", "application/json");

  try {
    // make sure, that we only have valid networks
    networks = parseNetworkString(networks);

    const newNetworks = await createNewNetworks(networks, db);
    newNetworks.forEach((net) => {
      lookupNetwork(net.cidr, requestId);
    });

    res.statusCode = 201;
    res.end(
      JSON.stringify(
        newNetworks.map((net) => ({ ...net.toObject(), users: [] }))
      )
    );
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e }));
  }
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [session, db]) => {
    if (!session || !isAdmin(session)) {
      res.status(401).end();
      return;
    }

    switch (req.method) {
      case "POST":
        return handlePost(req, res, db);
      default:
        res.status(405).end();
        return;
    }
  },
  withSession,
  withDB
);
