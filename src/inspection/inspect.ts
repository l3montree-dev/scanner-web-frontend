import { IDetailedReport } from "../types";
import { rabbitMQClient, rabbitMQRPCClient } from "../services/rabbitmqClient";

export const inspectRPC = async (requestId: string, fqdn: string) => {
  const result = await rabbitMQRPCClient.call<
    | {
        fqdn: string;
        results: {
          icon: string;
          results: IDetailedReport["result"];
        };
      }
    | { error: any }
  >(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      includeDetails: true,
      fqdn,
    },
    { messageId: requestId }
  );
  if ("error" in result) {
    throw new Error(result.error);
  }

  return result.results;
};

export const inspect = async (requestId: string, fqdn: string) => {
  const result = await rabbitMQClient.publish(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      includeDetails: false,
      fqdn,
    },
    { durable: true, maxPriority: 10 },
    { messageId: requestId, priority: 1 }
  );
  return result;
};
