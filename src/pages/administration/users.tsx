import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import Button from "../../components/Button";
import CreateUserForm from "../../components/CreateUserForm";
import DashboardPage from "../../components/DashboardPage";
import Modal from "../../components/Modal";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import {
  withToken,
  withTokenServerSideProps,
} from "../../decorators/withToken";
import { clientHttpClient } from "../../services/clientHttpClient";
import { getKcAdminClient } from "../../services/keycloak";
import { ICreateUserDTO, ISession } from "../../types";
import { isAdmin, parseNetworkString } from "../../utils/common";
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

const Users = () => {
  const [isOpen, setIsOpen] = useState(false);

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
    const body = await res.json();
    return body.password;
  };
  return (
    <DashboardPage>
      <SideNavigation />
      <div className="flex-1">
        <div className="flex flex-row w-full justfy-between">
          <h1 className="text-4xl flex-1 mb-3 text-white font-bold">
            Nutzerverwaltung
          </h1>
          <Button
            className="bg-deepblue-200 px-5 text-white"
            type="button"
            loading={false}
            onClick={() => setIsOpen(true)}
          >
            Nutzer erstellen
          </Button>
        </div>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="w-full mx-auto">
            <div>
              <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
                <h1 className="text-4xl sm:order-1 order-2 mb-3 text-white font-bold">
                  Nutzer erstellen
                </h1>
              </div>
              <CreateUserForm onCreateUser={handleCreateUser} />
            </div>
          </div>
        </Modal>
      </div>
    </DashboardPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [token]) => {
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

    // const users = await kcAdminClient.users.find();
    const users: any[] = [];
    return {
      props: {
        users,
      },
    };
  },
  withTokenServerSideProps
);

export default Users;
