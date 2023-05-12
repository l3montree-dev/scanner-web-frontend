"use client";
import {
  faQuestionCircle,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import React, { FunctionComponent, useEffect, useState } from "react";
import CreateUserForm from "../../../components/CreateUserForm";
import EditUserForm from "../../../components/EditUserForm";
import PageTitle from "../../../components/PageTitle";
import Button from "../../../components/common/Button";
import Menu from "../../../components/common/Menu";
import Modal from "../../../components/common/Modal";
import { classNames } from "../../../utils/common";
import Tooltip from "../../../components/common/Tooltip";

import { signIn } from "next-auth/react";

import { clientHttpClient } from "../../../services/clientHttpClient";
import { ICreateUserDTO } from "../../../types";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { User } from "@prisma/client";
import DropdownMenuItem from "../../../components/common/DropdownMenuItem";

interface Props {
  error: boolean;
  users: Array<UserRepresentation & User & { id: string }>;
}

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

const Content: FunctionComponent<Props> = (props) => {
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

    const res = await clientHttpClient("/api/v1/users", crypto.randomUUID(), {
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
      `/api/v1/users/${id}`,
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

  const handleUpdateUser = async (user: Omit<User, "defaultCollectionId">) => {
    const res = await clientHttpClient(
      `/api/v1/users/${user.id}`,
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
    <>
      <div className="flex-1">
        <div className="lg:flex lg:flex-row w-full flex-wrap  items-start justfy-between">
          <div className="flex-1">
            <div className=" mb-10 gap-2 px-4 flex flex-row items-center">
              <PageTitle
                className="text-2xl  mb-0 font-bold"
                stringRep="Nutzerverwaltung"
              >
                Nutzerverwaltung
              </PageTitle>
              <Tooltip
                tooltip={`         
    In der Nutzerverwaltung lassen sich die Nutzer des Systems
    einsehen, verwalten und löschen.`}
              >
                <div className="text-dunkelgrau-100">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </div>
              </Tooltip>
            </div>
          </div>
          <Button type="button" loading={false} onClick={() => setIsOpen(true)}>
            Nutzer erstellen
          </Button>
        </div>

        <table className="w-full text-left overflow-hidden border-separate border-spacing-2">
          <thead className="hidden lg:table-header-group">
            <tr className="bg-dunkelblau-100  text-sm text-white text-left">
              <th className="p-2 px-4 py-4">Nutzername</th>
              <th className="p-2 px-4 py-4">Vorname</th>
              <th className="p-2 px-4 py-4">Nachname</th>
              <th className="p-2 px-4 py-4">Rolle</th>
              <th className="p-2 whitespace-nowrap py-4">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                className={classNames(
                  "flex flex-col lg:table-row relative mt-3",
                  i % 2 !== 0 ? "bg-blau-20/40" : "bg-dunkelblau-20/20"
                )}
                key={user.id}
              >
                <td className="p-2 px-4">{user.username}</td>
                <td className="p-2 px-4">{user.firstName}</td>
                <td className="p-2 px-4">{user.lastName}</td>
                <td className="p-2 px-4">{user.role ? user.role : ""}</td>
                <td className="p-2 w-20 absolute lg:static top-0 right-0 text-right">
                  <div className="flex flex-row justify-end">
                    <Menu
                      Button={
                        <Button className="p-2 px-4 h-8 w-8 flex flex-row items-center justify-center">
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </Button>
                      }
                      Menu={
                        <>
                          <DropdownMenuItem onClick={() => setEdit(user)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                          >
                            Löschen
                          </DropdownMenuItem>
                        </>
                      }
                    />
                  </div>
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
  );
};

export default Content;
