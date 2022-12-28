import { NextApiRequest, NextApiResponse } from "next";
import { ModelsType } from "../../../db/models";
import { decorate } from "../../../decorators/decorate";
import { withAdmin } from "../../../decorators/withAdmin";
import { withDB } from "../../../decorators/withDB";
import MethodNotAllowed from "../../../errors/MethodNotAllowed";
import NotFoundException from "../../../errors/NotFoundException";
import { INetworkPatchDTO } from "../../../types";

const handlePatch = async (
  req: NextApiRequest,
  res: NextApiResponse,
  db: ModelsType
) => {
  const networkId = req.query.networkId as string;
  if (!networkId) {
    throw new NotFoundException();
  }
  const patchRequest: INetworkPatchDTO = JSON.parse(req.body);
  const network = await db.Network.findOneAndUpdate(
    {
      _id: networkId,
    },
    {
      comment: patchRequest.comment,
    }
  ).lean();
  return network;
};

const handleDelete = async (
  req: NextApiRequest,
  res: NextApiResponse,
  db: ModelsType
) => {
  const networkId = req.query.networkId as string;
  if (!networkId) {
    throw new NotFoundException();
  }
  const network = await Promise.all([
    db.Network.findOneAndDelete({
      _id: networkId,
    }).lean(),

    // iterate over all users and delete the network from their list
    db.User.updateMany(
      {},
      {
        $pull: {
          networks: networkId,
        },
      }
    ),
  ]);

  return network;
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
