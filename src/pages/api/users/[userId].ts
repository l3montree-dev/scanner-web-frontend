import { NextApiRequest, NextApiResponse } from "next";
import { ModelsType } from "../../../db/models";
import { decorate } from "../../../decorators/decorate";
import { withAdmin } from "../../../decorators/withAdmin";
import { withDB } from "../../../decorators/withDB";
import { withToken } from "../../../decorators/withToken";
import MethodNotAllowed from "../../../errors/MethodNotAllowed";
import NotFoundException from "../../../errors/NotFoundException";
import { keycloak } from "../../../services/keycloak";
import { userService } from "../../../services/userService";
import { IToken, IUserPutDTO } from "../../../types";

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

  const kcClient = keycloak.getKcAdminClient(token.accessToken);
  await kcClient.users.update(
    {
      id: userId,
      realm: keycloak.getRealmName(),
    },
    {
      firstName: putRequest.firstName,
      lastName: putRequest.lastName,
    }
  );

  const user = await userService.updateUser(
    userId,
    {
      ...putRequest,
      _id: userId,
    },
    db
  );

  return {
    ...user,
    _id: userId,
    firstName: putRequest.firstName,
    lastName: putRequest.lastName,
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
  const kcClient = keycloak.getKcAdminClient(token.accessToken);
  await kcClient.users.del({ id: userId, realm: keycloak.getRealmName() });
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
