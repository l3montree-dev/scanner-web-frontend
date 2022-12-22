import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { tryDB } from "../../decorators/tryDB";
import { withToken } from "../../decorators/withToken";
import { getKcAdminClient, getRealmName } from "../../services/keycloak";
import { ICreateUserDTO } from "../../types";
import { parseNetwork } from "../../utils/common";

export default decorate(
  async (req: NextApiRequest, res: NextApiResponse, [db, token]) => {
    if (!token) {
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

    const kcClient = getKcAdminClient(token?.accessToken);

    try {
      const password = Math.random().toString(36).substring(2, 15);
      const { id } = await kcClient.users.create({
        realm: getRealmName(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailVerified: true, // TODO: Change for real validation
        enabled: true,
        requiredActions: ["UPDATE_PASSWORD"],
        attributes: {
          role: user.role,
        },
        credentials: [
          {
            type: "password",
            temporary: true,
            value: password,
          },
        ],
      });

      // create a new user inside our database as well.
      try {
        await db.User?.create({
          _id: id,
          networks: user.networks.map(parseNetwork),
        });
        res.end(JSON.stringify({ success: true, password }));
        // request the domain lookup for each network.
      } catch (e) {
        // Rollback keycloak if this fails.
        await kcClient.users.del({ id, realm: getRealmName() });
        res.status(500).end(JSON.stringify({ error: e }));
        return;
      }
    } catch (e: any) {
      res.status(500).end(JSON.stringify({ error: e.message }));
    }
  },
  tryDB,
  withToken
);
