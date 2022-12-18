import { rabbitMQClient, rabbitMQRPCClient } from "../services/rabbitmqClient";
import { IReport } from "../types";

export const inspectRPC = async (
  requestId: string,
  fqdn: string
): Promise<{
  ipAddress: string;
  fqdn: string;
  icon: string;
  timestamp: number;
  result: IReport["result"];
}> => {
  const result = await rabbitMQRPCClient.call<{
    ipAddress: string;
    fqdn: string;
    icon: string;
    timestamp: number;
    result: IReport["result"] | { error: any };
  }>(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      fqdn,
    },
    { messageId: requestId }
  );

  if ("error" in result.result) {
    throw new Error(result.result.error);
  }

  // @ts-expect-error
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
