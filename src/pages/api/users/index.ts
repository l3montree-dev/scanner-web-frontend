import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../../decorators/decorate";
import { withDB } from "../../../decorators/withDB";
import { withToken } from "../../../decorators/withToken";
import { keycloak } from "../../../services/keycloak";
import { getLogger } from "../../../services/logger";
import { userService } from "../../../services/userService";

import { ICreateUserDTO } from "../../../types";

const logger = getLogger(__filename);
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

    const kcClient = keycloak.getKcAdminClient(token?.accessToken);

    try {
      const password = `${Math.random()
        .toString(36)
        .substring(2, 15)
        .split("")
        .map((x) => (Math.random() > 0.5 ? x.toUpperCase() : x))
        .join("")}&`;
      const { id } = await kcClient.users.create({
        realm: keycloak.getRealmName(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        emailVerified: true,
        enabled: true,
        requiredActions: ["UPDATE_PASSWORD"],
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
        await userService.createUser(
          {
            ...user,
            _id: id,
          },
          db
        );
        res.end(
          JSON.stringify({
            success: true,
            password,
            user: {
              ...user,
              _id: id,
            },
          })
        );
      } catch (e) {
        // Rollback keycloak if this fails.
        await kcClient.users.del({ id, realm: keycloak.getRealmName() });
        res.status(500).end(JSON.stringify({ error: e }));
        return;
      }
    } catch (e: any) {
      logger.error({ error: e.message }, "Error creating user");
      res.status(500).end(JSON.stringify({ error: e.message }));
    }
  },
  withDB,
  withToken
);
