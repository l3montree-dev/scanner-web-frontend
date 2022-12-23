import { rabbitMQRPCClient } from "./rabbitmqClient";

export const lookupNetwork = async (cidr: string, requestId: string) => {
  // does a fire and forget. The response will be sent to the queue "ip-lookup-response"
  return rabbitMQRPCClient.publish(
    "ip-lookup",
    {
      cidr,
    },
    { durable: true, maxPriority: 10 },
    {
      messageId: requestId,
      replyTo: "ip-lookup-response",
    }
  );
};
