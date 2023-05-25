import { rabbitMQClient, rabbitMQRPCClient } from "../services/rabbitmqClient";
import { IScanResponse } from "../types";

export const inspectRPC = async (
  requestId: string,
  target: string,
  refresh: boolean = false
): Promise<IScanResponse> => {
  const result = await rabbitMQRPCClient.call<IScanResponse>(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      target,
      refresh, // if refresh is true, it will bypass all caching layers
    },
    { messageId: requestId }
  );

  return result;
};

export const inspect = async (requestId: string, target: string) => {
  const result = await rabbitMQClient.publish(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      target,
    },
    { durable: true, maxPriority: 10 },
    { messageId: requestId, priority: 1, replyTo: "scan-response" }
  );
  return result;
};
