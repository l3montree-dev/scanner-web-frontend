import { INetwork } from "../types";
import { rabbitMQRPCClient } from "./rabbitmqClient";
import ip from "ip";

export const lookupNetwork = async (cidr: string, requestId: string) => {
  // does a fire and forget. The response will be sent to the queue "ip-lookup-response"
  return rabbitMQRPCClient.publish(
    "ip-lookup",
    {
      cidr,
    },
    { durable: true },
    {
      messageId: requestId,
      replyTo: "ip-lookup-response",
    }
  );
};

export const filterToIpInNetwork = (
  ipAddresses: string[],
  networks: INetwork[]
) => {
  return ipAddresses.filter((ipAddress) => {
    const ipNumber = ip.toLong(ipAddress);
    return networks.some((network) => {
      return (
        ipNumber >= network.startAddressNumber &&
        ipNumber <= network.endAddressNumber
      );
    });
  });
};
