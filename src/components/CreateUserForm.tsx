import React, { FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { ICreateUserDTO } from "../types";
import { isValidIp, isValidMask } from "../utils/validator";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import PrimaryButton from "./PrimaryButton";

interface Props {
  onCreateUser: (
    form: Omit<ICreateUserDTO, "networks"> & { networks: string }
  ) => Promise<string>; // should return the password of the user
}
const CreateUserForm: FunctionComponent<Props> = ({ onCreateUser }) => {
  const createRequest = useLoading();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [networks, setNetworks] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setUserPassword("");
      createRequest.loading();
      const password = await onCreateUser({
        firstName,
        lastName,
        networks,
        username,
        role,
      });
      setUserPassword(password);
      // reset the form
      setUsername("");
      setFirstName("");
      setLastName("");
      setRole("");
      setNetworks("");

      createRequest.success();
    } catch (e: any) {
      createRequest.error(e.toString());
    }
  };
  return (
    <div>
      <form onSubmit={onSubmit} className="pt-10  flex">
        <div className="flex flex-col flex-1">
          <FormInput
            label="Nutzername *"
            validator={(value) => {
              if (value.length === 0) {
                return "Bitte trage einen Nutzernamen ein.";
              }
              return true;
            }}
            onChange={setUsername}
            value={username}
          />
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
          <div className="flex flex-row justify-end mt-5">
            <PrimaryButton loading={createRequest.isLoading} type="submit">
              Nutzer anlegen
            </PrimaryButton>
          </div>
        </div>
      </form>

      {createRequest.errored && (
        <span className="text-red-600 absolute text-sm mt-3 block">
          {createRequest.errorMessage}
        </span>
      )}
      {userPassword && (
        <div className="mt-5 text-right border-yellow-500 border bg-deepblue-600 p-2">
          <p className="text-white">
            Nutzer wurde mit folgendem initialen Password angelegt:
          </p>
          <p className="font-bold text-white">{userPassword}</p>
        </div>
      )}
    </div>
  );
};

export default CreateUserForm;
