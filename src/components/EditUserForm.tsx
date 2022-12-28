import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import React, { FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { ICreateUserDTO, IUser, IUserPutDTO } from "../types";
import { isValidIp, isValidMask } from "../utils/validator";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import PrimaryButton from "./PrimaryButton";

type UserType = Omit<IUser, "_id"> & { id: string } & UserRepresentation;
interface Props extends UserType {
  onSave: (
    form: Omit<IUserPutDTO, "networks"> & { networks: string; id: string }
  ) => Promise<void>; // should return the password of the user
}
const EditUserForm: FunctionComponent<Props> = (props) => {
  const createRequest = useLoading();

  const [username, setUsername] = useState(props.username ?? "");
  const [firstName, setFirstName] = useState(props.firstName ?? "");
  const [lastName, setLastName] = useState(props.lastName ?? "");
  const [role, setRole] = useState(props.role ?? "");
  const [networks, setNetworks] = useState(
    props.networks.map((n) => n.cidr).join("\n")
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      createRequest.loading();
      await props.onSave({
        id: props.id,
        firstName,
        lastName,
        networks,
        username,
        role,
      });

      createRequest.success();
    } catch (e: any) {
      createRequest.error(e.toString());
    }
  };
  return (
    <div>
      <div className="text-white pt-5">
        Ausgewähltes Nutzer: <b>{props.username}</b>
      </div>
      <form onSubmit={onSubmit} className="pt-5  flex">
        <div className="flex flex-col flex-1">
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
          <div className="mt-4 flex-col flex">
            <FormTextarea
              label="Netzwerke (CIDR-Notation) *"
              onChange={setNetworks}
              value={networks}
              validator={(value) => {
                const networksArray = value.trim().split("\n");
                // check if each network is in cidr notation.

                const networksValid = networksArray.every((network) => {
                  const [ip, mask] = network.split("/");
                  if (ip === undefined || mask === undefined) {
                    return false;
                  }
                  const ipValid = isValidIp(ip);
                  const maskValid = isValidMask(mask);
                  return ipValid && maskValid;
                });
                if (!networksValid) {
                  return "Bitte trage gültige Netzwerke ein.";
                }
                return true;
              }}
              placeholder={`45.10.26.0/24
45.12.32.0/16
                  `}
            />
            <span className="text-white text-right text-sm mt-1">
              Mehrere Netzwerke können durch Zeilenumbrüche getrennt werden.
            </span>
          </div>
          <div className="flex flex-row justify-end mt-5">
            <PrimaryButton loading={createRequest.isLoading} type="submit">
              Speichern
            </PrimaryButton>
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
