import { PrismaClient } from "@prisma/client";
import { parseNetwork } from "../utils/common";

const getAll = async (prisma: PrismaClient) => {
  return prisma.network.findMany();
};

const createNetworks = async (networks: string[], prisma: PrismaClient) => {
  // first create all the networks.
  // check which networks do already exist based on the cidr
  const existingNetworks = await prisma.network.findMany({
    where: {
      cidr: {
        in: networks,
      },
    },
  });
  // filter the existing networks.
  const newNetworks = networks.filter(
    (network) =>
      !existingNetworks.find(
        (existingNetwork) => existingNetwork.cidr === network
      )
  );
  const data = newNetworks.map(parseNetwork);
  // create the new networks.
  await prisma.network.createMany({
    data,
  });
  return data;
};

export const networkService = {
  getAll,
  createNetworks,
};
