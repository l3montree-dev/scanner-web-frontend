import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { User } from "@prisma/client";
import { signIn } from "next-auth/react";
import { FunctionComponent, useEffect, useState } from "react";
import AdministrationPage from "../../components/AdministrationPage";
import Button from "../../components/Button";
import CreateUserForm from "../../components/CreateUserForm";
import EditUserForm from "../../components/EditUserForm";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Modal from "../../components/Modal";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withDB } from "../../decorators/withDB";
import { withTokenServerSideProps } from "../../decorators/withToken";
import { clientHttpClient } from "../../services/clientHttpClient";
import { keycloak } from "../../services/keycloak";
import { userService } from "../../services/userService";

import { ICreateUserDTO } from "../../types";
import { classNames, isAdmin } from "../../utils/common";

export const parseCreateUserForm = ({
  firstName,
  lastName,
  username,
  role,
}: {
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}): ICreateUserDTO => {
  if (username.length === 0) {
    throw new Error("Bitte trage einen Nutzernamen ein.");
  }

  return {
    firstName,
    lastName,
    username,
    role,
  };
};

interface Props {
  error: boolean;
  users: Array<UserRepresentation & User & { id: string }>;
}
const Users: FunctionComponent<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUser] = useState(props.users);
  const [edit, setEdit] = useState<Props["users"][0] | null>(null);

  const handleCreateUser = async (form: ICreateUserDTO) => {
    const { firstName, lastName, username, role } = form;
    const createUserDTO = parseCreateUserForm({
      firstName,
      lastName,
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
    const user: User = body.user;

    setUser((users) => [user, ...users]);
    return body.password;
  };

  useEffect(() => {
    if (props.error) {
      signIn("keycloak");
    }
  }, [props.error]);

  const handleDelete = async (id: string) => {
    const res = await clientHttpClient(
      `/api/users/${id}`,
      crypto.randomUUID(),
      {
        method: "DELETE",
      }
    );
    if (!res.ok) {
      throw res;
    }
    setUser((users) => users.filter((user) => user.id !== id));
    setEdit(null);
  };

  const handleUpdateUser = async (user: User) => {
    const res = await clientHttpClient(
      `/api/users/${user.id}`,
      crypto.randomUUID(),
      {
        method: "PUT",
        body: JSON.stringify(user),
      }
    );
    if (!res.ok) {
      throw res;
    }
    const body: User = await res.json();

    setUser((users) =>
      users.map((u) =>
        u.id === body.id ? { ...body, username: u.username } : u
      )
    );
    setEdit(null);
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
              className="bg-lightning-500 hover:bg-lightning-900 font-bold transition-all py-3 px-5 text-black"
              type="button"
              loading={false}
              onClick={() => setIsOpen(true)}
            >
              Nutzer erstellen
            </Button>
          </div>

          <table className="w-full text-left text-white border-deepblue-50 border mt-10 bg-deepblue-500">
            <thead>
              <tr className="bg-deepblue-200  text-sm border-b border-b-deepblue-50 text-left">
                <th className="p-2 py-4">Nutzername</th>
                <th className="p-2 py-4">Vorname</th>
                <th className="p-2 py-4">Nachname</th>
                <th className="p-2 py-4">Rolle</th>
                <th className="p-2 py-4">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  className={classNames(
                    i % 2 === 0 ? "bg-deepblue-400" : "bg-deepblue-500",
                    i + 1 !== users.length ? "border-b" : "",
                    " border-b-deepblue-500 transition-all"
                  )}
                  key={user.id}
                >
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.firstName}</td>
                  <td className="p-2">{user.lastName}</td>
                  <td className="p-2">{user.role ? user.role : ""}</td>
                  <td className="p-2 w-20 text-right">
                    <Menu
                      Button={
                        <div className="p-2 h-8 w-8 flex flex-row items-center justify-center">
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </div>
                      }
                      Menu={
                        <MenuList>
                          <MenuItem onClick={() => setEdit(user)}>
                            Bearbeiten
                          </MenuItem>
                          <MenuItem onClick={() => handleDelete(user.id)}>
                            Löschen
                          </MenuItem>
                        </MenuList>
                      }
                    />
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
        <Modal
          title="Nutzer bearbeiten"
          isOpen={!!edit}
          onClose={() => setEdit(null)}
        >
          {edit && <EditUserForm {...edit} onSave={handleUpdateUser} />}
        </Modal>
      </>
    </AdministrationPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (_context, [token, db]) => {
    // check if the user is an admin
    // if not, redirect him to the dashboard page.
    if (!isAdmin(token)) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    // fetch all users from keycloak
    const kcAdminClient = keycloak.getKcAdminClient(token.accessToken);

    try {
      const [kcUsers, users] = await Promise.all([
        kcAdminClient.users.find(),
        userService.getAll(db),
      ]);

      // attach the networks to the kc users.
      return {
        props: {
          error: false,
          users: kcUsers.map((user) => {
            const userFromDB = users.find((u) => u.id === user.id);
            return {
              ...user,
              role: userFromDB?.role ?? "",
            };
          }),
        },
      };
    } catch (e) {
      // log the user out and redirect to keycloak
      return {
        props: {
          error: true,
          users: [],
        },
      };
    }
  },
  withTokenServerSideProps,
  withDB
);

export default Users;
