import { randomUUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { getLogger } from "../../services/logger";
import { rabbitMQRPCClient } from "../../services/rabbitmqClient";

const logger = getLogger(__filename);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // extract the IP address from the request
  const cidr = req.query.cidr;
  if (typeof cidr !== "string") {
    res.status(400).send("Invalid CIDR");
    return;
  }

  const requestId =
    (req.headers["x-request-id"] as string | undefined) ?? randomUUID();

  logger.info({ cidr, requestId }, "received request");

  const result = await rabbitMQRPCClient.call(
    "ip-lookup",
    {
      cidr,
    },
    {
      messageId: requestId,
    }
  );
  res.status(200).json(result);
}
