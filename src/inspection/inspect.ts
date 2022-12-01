import { rabbitMQRPCClient } from "../services/rabbitmqClient";

export const inspectRPC = async (requestId: string, fqdn: string) => {
  const result = await rabbitMQRPCClient.call(
    process.env.SCAN_REQUEST_QUEUE ?? "scan-request",
    {
      fqdn,
    },
    { messageId: requestId }
  );
  return result;
};
