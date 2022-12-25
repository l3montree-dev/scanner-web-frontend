import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withSession } from "../../decorators/withSession";
import { lookupNetwork } from "../../services/ipService";
import { createNewNetworks } from "../../services/networkService";
import { rabbitMQClient } from "../../services/rabbitmqClient";
import { parseNetworkString } from "../../utils/common";

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [session, db]) => {
    if (!session) {
      res.status(401).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    const requestId = req.headers["x-request-id"] as string;

    let networks: string[] = JSON.parse(req.body);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    try {
      // make sure, that we only have valid networks
      networks = parseNetworkString(networks);

      const newNetworks = await createNewNetworks(networks, db);
      newNetworks.forEach((net) => {
        lookupNetwork(net.cidr, requestId);
      });

      res.end(
        JSON.stringify(
          newNetworks.map((net) => ({ ...net.toObject(), users: [] }))
        )
      );
    } catch (e) {
      res.end(JSON.stringify({ error: e }));
    }
  },
  withSession,
  withDB
);
