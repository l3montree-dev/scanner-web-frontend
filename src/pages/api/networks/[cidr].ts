import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../decorators/decorate";
import { withAdmin } from "../../../decorators/withAdmin";
import { withDB } from "../../../decorators/withDB";
import MethodNotAllowed from "../../../errors/MethodNotAllowed";
import NotFoundException from "../../../errors/NotFoundException";
import { INetworkPatchDTO } from "../../../types";

const handlePatch = async (
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient
) => {
  const cidr = req.query.cidr as string;
  if (!cidr) {
    throw new NotFoundException();
  }
  const patchRequest: INetworkPatchDTO = JSON.parse(req.body);
  const network = await prisma.network.update({
    where: {
      cidr,
    },
    data: {
      comment: patchRequest.comment ?? null,
    },
  });

  return network;
};

const handleDelete = async (
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient
) => {
  const cidr = req.query.cidr as string;
  if (!cidr) {
    throw new NotFoundException();
  }
  await prisma.network.delete({
    where: {
      cidr,
    },
  });

  return {
    success: true,
  };
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [_, db]) => {
    switch (req.method) {
      case "PATCH":
        return handlePatch(req, res, db);
      case "DELETE":
        return handleDelete(req, res, db);
      default:
        throw new MethodNotAllowed();
    }
  },
  withAdmin,
  withDB
);
