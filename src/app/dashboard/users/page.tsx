import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { User } from "@prisma/client";
import { cookies } from "next/dist/client/components/headers";
import { redirect } from "next/navigation";
import { keycloak } from "../../../services/keycloak";
import { isAdmin } from "../../../utils/common";
import { getJWTToken } from "../../../utils/server";
import Content from "./content";

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
    const kcUsers = await kcAdminClient.users.find();

    // attach the networks to the kc users.
    props = {
      error: false,
      users: kcUsers.map((user) => {
        return {
          ...user,
          id: user.id as string,
          defaultCollectionId: 0,
          //   role: userFromDB?.role ?? "",
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
