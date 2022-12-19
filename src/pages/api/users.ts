import { Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import { withToken } from "../../decorators/withToken";
import { getKcAdminClient, getRealmName } from "../../services/keycloak";
import { ICreateUserDTO, IToken, IUser } from "../../types";
import { parseNetwork } from "../../utils/common";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  params: {
    User: Model<IUser> | null;
    token: IToken | null;
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
  const user: ICreateUserDTO = JSON.parse(req.body);
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
      emailVerified: true, // TODO: Change for real validation
      enabled: true,
      requiredActions: ["UPDATE_PASSWORD"],
    });

    // create a new user inside our database as well.
    try {
      await params.User?.create({
        _id: id,
        networks: user.networks.map(parseNetwork),
      });
      res.end(JSON.stringify({ success: true }));
      // request the domain lookup for each network.
    } catch (e) {
      console.log(e);
      // Rollback keycloak if this fails.
      await kcClient.users.del({ id, realm: getRealmName() });
      res.status(500).end(JSON.stringify({ error: e }));
      return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).end(JSON.stringify({ error: e }));
  }
}

export default decorate(handler, withDB, withToken);
