import { Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withToken } from "../../decorators/withToken";
import { getKcAdminClient, getRealmName } from "../../services/keycloak";
import { CreateUserDTO, IReport, IUser, Token } from "../../types";
import { parseNetwork } from "../../utils/common";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  params: {
    User: Model<IUser> | null;
    token: Token | null;
  }
) {
  if (!params.token) {
    res.statusCode = 401;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }
  const user: CreateUserDTO = JSON.parse(req.body);
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  const kcClient = getKcAdminClient(params.token?.accessToken);

  try {
    const { id } = await kcClient.users.create({
      realm: getRealmName(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    });

    // create a new user inside our database as well.
    try {
      await params.User?.create({
        _id: id,
        networks: user.networks.map(parseNetwork),
      });
    } catch (e) {
      // Rollback keycloak if this fails.
      await kcClient.users.del({ id, realm: getRealmName() });
    }

    res.end(JSON.stringify({ success: true }));
  } catch (e) {
    // console.log(e);
    res.end(JSON.stringify({ error: e }));
  }
}

export default decorate(handler, withDB, withToken);
