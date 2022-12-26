import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { unstable_getServerSession } from "next-auth";
import { FunctionComponent, useState } from "react";
import AdministrationPage from "../../components/AdministrationPage";
import Button from "../../components/Button";
import CreateUserForm from "../../components/CreateUserForm";
import Modal from "../../components/Modal";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withDB } from "../../decorators/withDB";
import { withTokenServerSideProps } from "../../decorators/withToken";
import { clientHttpClient } from "../../services/clientHttpClient";
import { getKcAdminClient } from "../../services/keycloak";
import { getAll } from "../../services/userService";
import {
  ICreateUserDTO,
  INetwork,
  ISession,
  IUser,
  WithoutId,
} from "../../types";
import { classNames, isAdmin, parseNetworkString } from "../../utils/common";
import { authOptions } from "../api/auth/[...nextauth]";

export const parseCreateUserForm = ({
  firstName,
  lastName,
  networks,
  username,
  role,
}: {
  firstName: string;
  lastName: string;
  username: string;
  networks: string;
  role: string;
}): ICreateUserDTO => {
  if (username.length === 0) {
    throw new Error("Bitte trage einen Nutzernamen ein.");
  }

  const networksArray = parseNetworkString(networks);
  return {
    firstName,
    lastName,
    networks: networksArray,
    username,
    role,
  };
};

interface Props {
  users: Array<UserRepresentation & { networks: WithoutId<INetwork>[] }>;
}
const Users: FunctionComponent<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUser] = useState(props.users);

  const handleCreateUser = async (
    form: Omit<ICreateUserDTO, "networks"> & { networks: string }
  ) => {
    const { firstName, lastName, networks, username, role } = form;
    const createUserDTO = parseCreateUserForm({
      firstName,
      lastName,
      networks,
      username,
      role,
    });

    const res = await clientHttpClient("/api/users", crypto.randomUUID(), {
      method: "POST",
      body: JSON.stringify(createUserDTO),
    });
    if (!res.ok) {
      throw res;
    }
    const body = await res.json();
    const user: IUser = body.user;
    setUser((users) => [user, ...users]);
    return body.password;
  };
  return (
    <AdministrationPage title="Nutzerverwaltung">
      <SideNavigation />
      <>
        <div className="flex-1">
          <div className="flex flex-row w-full items-start justfy-between">
            <div className="flex-1">
              <h1 className="text-4xl mb-5 text-white font-bold">
                Nutzerverwaltung
              </h1>
              <p className="text-white w-1/2">
                In der Nutzerverwaltung lassen sich die Nutzer des Systems
                einsehen, verwalten und löschen.
              </p>
            </div>
            <Button
              className="bg-deepblue-200 border-deepblue-200 border hover:bg-deepblue-300 transition-all py-3 px-5 text-white"
              type="button"
              loading={false}
              onClick={() => setIsOpen(true)}
            >
              Nutzer erstellen
            </Button>
          </div>

          <table className="w-full text-left text-white w-full border-deepblue-500 mt-10 bg-deepblue-400">
            <thead>
              <tr className="bg-deepblue-100  text-sm border-b border-b-deepblue-500 text-left">
                <th className="p-2 py-4">Nutzername</th>
                <th className="p-2 py-4">Vorname</th>
                <th className="p-2 py-4">Nachname</th>
                <th className="p-2 py-4">Rolle</th>
                <th className="p-2 py-4">Netzwerke</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  className={classNames(
                    i + 1 !== users.length ? "border-bg" : "",
                    "border-b border-b-deepblue-500 transition-all"
                  )}
                  key={user.id}
                >
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.firstName}</td>
                  <td className="p-2">{user.lastName}</td>
                  <td className="p-2">
                    {user.attributes ? user.attributes["role"] : ""}
                  </td>
                  <td className="p-2">
                    {user.networks.map((network) => (
                      <span className="mr-2" key={network.cidr}>
                        {network.cidr}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal
          title="Nutzer erstellen"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <CreateUserForm onCreateUser={handleCreateUser} />
        </Modal>
      </>
    </AdministrationPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [token, db]) => {
    const session = (await unstable_getServerSession(
      context.req,
      context.res,
      authOptions
    )) as ISession;

    // check if the user is an admin
    // if not, redirect him to the dashboard page.
    if (!isAdmin(session)) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    // fetch all users from keycloak
    const kcAdminClient = getKcAdminClient(token.accessToken);

    try {
      const [kcUsers, users] = await Promise.all([
        kcAdminClient.users.find(),
        getAll(db),
      ]);

      // attach the networks to the kc users.
      return {
        props: {
          users: kcUsers.map((user) => {
            const userFromDB = users.find((u) => u._id === user.id);
            return {
              ...user,
              networks: userFromDB?.networks ?? [],
            };
          }),
        },
      };
    } catch (e) {
      // log the user out and redirect to keycloak
      return {
        redirect: {
          destination:
            "/auth/keycloak-sign-in?redirectTo=/administration/users",
          permanent: false,
        },
      };
    }
  },
  withTokenServerSideProps,
  withDB
);

export default Users;
