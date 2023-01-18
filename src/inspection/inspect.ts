import { rabbitMQClient, rabbitMQRPCClient } from "../services/rabbitmqClient";
import { IScanResponse } from "../types";

export const inspectRPC = async (
  requestId: string,
  fqdn: string
): Promise<IScanResponse> => {
  const result = await rabbitMQRPCClient.call<IScanResponse>(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      fqdn,
    },
    { messageId: requestId }
  );

  return result;
};

export const inspect = async (requestId: string, fqdn: string) => {
  const result = await rabbitMQClient.publish(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      fqdn,
    },
    { durable: true, maxPriority: 10 },
    { messageId: requestId, priority: 1, replyTo: "scan-response" }
  );
  return result;
};
