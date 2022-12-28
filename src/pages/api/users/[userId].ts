import { NextApiRequest, NextApiResponse } from "next";
import { ModelsType } from "../../../db/models";
import { decorate } from "../../../decorators/decorate";
import { withAdmin } from "../../../decorators/withAdmin";
import { withDB } from "../../../decorators/withDB";
import { withToken } from "../../../decorators/withToken";
import MethodNotAllowed from "../../../errors/MethodNotAllowed";
import NotFoundException from "../../../errors/NotFoundException";
import { getKcAdminClient, getRealmName } from "../../../services/keycloak";
import { updateUser } from "../../../services/userService";
import { IToken, IUserPutDTO } from "../../../types";
import { parseNetwork } from "../../../utils/common";

const handlePut = async (
  token: IToken,
  req: NextApiRequest,
  res: NextApiResponse,
  db: ModelsType
) => {
  const userId = req.query.userId as string;
  if (!userId) {
    throw new NotFoundException();
  }
  const putRequest: IUserPutDTO = JSON.parse(req.body);

  const kcClient = getKcAdminClient(token.accessToken);
  await kcClient.users.update(
    {
      id: userId,
      realm: getRealmName(),
    },
    {
      firstName: putRequest.firstName,
      lastName: putRequest.lastName,
    }
  );

  const [user, _] = await updateUser(
    userId,
    {
      ...putRequest,
      _id: userId,
      networks: putRequest.networks.map(parseNetwork),
    },
    db
  );

  return {
    ...user,
    _id: userId,
    firstName: putRequest.firstName,
    lastName: putRequest.lastName,
    networks: putRequest.networks.map(parseNetwork),
  };
};

const handleDelete = async (
  token: IToken,
  req: NextApiRequest,
  res: NextApiResponse,
  db: ModelsType
) => {
  const userId = req.query.userId as string;
  if (!userId) {
    throw new NotFoundException();
  }
  const kcClient = getKcAdminClient(token.accessToken);
  await kcClient.users.del({ id: userId, realm: getRealmName() });
  const user = await db.User.findOneAndDelete({
    _id: userId,
  });

  return user;
};

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [token, _, db]) => {
    switch (req.method) {
      case "PUT":
        return handlePut(token, req, res, db);
      case "DELETE":
        return handleDelete(token, req, res, db);
      default:
        throw new MethodNotAllowed();
    }
  },
  withToken,
  withAdmin,
  withDB
);
