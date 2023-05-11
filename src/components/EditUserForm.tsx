import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { User } from "@prisma/client";
import React, { FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { IUserPutDTO } from "../types";
import FormInput from "./common/FormInput";
import Button from "./common/Button";

type UserType = Omit<User, "_id"> & { id: string } & UserRepresentation;
interface Props extends UserType {
  onSave: (form: IUserPutDTO & { id: string }) => Promise<void>; // should return the password of the user
}
const EditUserForm: FunctionComponent<Props> = (props) => {
  const createRequest = useLoading();

  const [firstName, setFirstName] = useState(props.firstName ?? "");
  const [lastName, setLastName] = useState(props.lastName ?? "");
  const [role, setRole] = useState(props.role ?? "");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      createRequest.loading();
      await props.onSave({
        id: props.id,
        firstName,
        lastName,
        username: props.username ?? "",
        role,
      });

      createRequest.success();
    } catch (e: any) {
      createRequest.error(e.toString());
    }
  };
  return (
    <div>
      <form onSubmit={onSubmit} className="pt-5 flex">
        <div className="flex flex-col gap-5 flex-1">
          <div className="mt-4 flex-col flex">
            <FormInput
              label="Vorname"
              onChange={setFirstName}
              value={firstName}
            />
          </div>
          <div className="mt-4 flex-col flex">
            <FormInput
              label="Nachname"
              onChange={setLastName}
              value={lastName}
            />
          </div>
          <div className="mt-4 flex-col flex">
            <FormInput label="Rolle" onChange={setRole} value={role} />
          </div>
          <div className="flex flex-row text-base justify-end mt-5">
            <Button loading={createRequest.isLoading} type="submit">
              Speichern
            </Button>
          </div>
        </div>
      </form>

      {createRequest.errored && (
        <span className="text-red-600 absolute text-sm mt-3 block">
          {createRequest.errorMessage}
        </span>
      )}
    </div>
  );
};

export default EditUserForm;
