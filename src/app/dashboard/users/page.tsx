import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { cookies } from "next/dist/client/components/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../../db/connection";
import { keycloak } from "../../../services/keycloak";
import { userService } from "../../../services/userService";
import { isAdmin } from "../../../utils/common";
import { getJWTToken } from "../../../utils/server";
import Content from "./content";
import { User } from "@prisma/client";

const Page = async () => {
  const token = await getJWTToken({
    req: { cookies: cookies() },
  } as any);
  // check if the user is an admin
  // if not, redirect him to the dashboard page.
  if (!isAdmin(token) || !token) {
    return redirect("/dashboard");
  }

  // fetch all users from keycloak
  const kcAdminClient = keycloak.getKcAdminClient(token.accessToken);

  let props: {
    error: boolean;
    users: Array<UserRepresentation & User & { id: string }>;
  };
  try {
    const [kcUsers, users] = await Promise.all([
      kcAdminClient.users.find(),
      userService.getAll(prisma),
    ]);

    // attach the networks to the kc users.
    props = {
      error: false,
      users: kcUsers.map((user) => {
        const userFromDB = users.find((u) => u.id === user.id);
        return {
          ...user,
          id: user.id as string,
          defaultCollectionId: 0,
          role: userFromDB?.role ?? "",
        };
      }),
    };
  } catch (e) {
    console.log(e);
    // log the user out and redirect to keycloak
    props = {
      error: true,
      users: [],
    };
  }
  return <Content {...props} />;
};

export default Page;
