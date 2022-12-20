import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { withSession } from "../../decorators/withSession";
import { rabbitMQClient } from "../../services/rabbitmqClient";
import { parseNetworkString } from "../../utils/common";

export default decorate(
  (req: NextApiRequest, res: NextApiResponse, [session]) => {
    if (!session) {
      res.status(401).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).end();
      return;
    }

    let networks: string[] = JSON.parse(req.body);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    try {
      // make sure, that we only have valid networks
      networks = parseNetworkString(networks);

      networks.forEach((cidr) => {
        rabbitMQClient.publish(
          "ip-lookup",
          {
            cidr,
          },
          { durable: true, maxPriority: 10 },
          { replyTo: "ip-lookup-response" }
        );
      });

      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      console.log(e);
      res.end(JSON.stringify({ error: e }));
    }
  },
  withSession
);
