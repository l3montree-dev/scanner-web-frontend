import React, { FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { ICreateUserDTO } from "../types";
import Button from "./common/Button";

import FormInput from "./common/FormInput";

interface Props {
  onCreateUser: (
    form: Omit<ICreateUserDTO, "networks"> & { networks: string }
  ) => Promise<string>; // should return the password of the user
}
const CreateUserForm: FunctionComponent<Props> = ({ onCreateUser }) => {
  const createRequest = useLoading();

  const [username, setUsername] = useState("");
  const [networks, setNetworks] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setUserPassword("");
      createRequest.loading();
      const password = await onCreateUser({
        networks,
        username,
      });
      setUserPassword(password);
      // reset the form
      setUsername("");
      setNetworks("");

      createRequest.success();
    } catch (e: any) {
      createRequest.error(e.toString());
    }
  };
  return (
    <div>
      <form onSubmit={onSubmit} className="pt-10  flex">
        <div className="flex flex-col gap-5 flex-1">
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
          <div className="flex flex-row text-base justify-end mt-5">
            <Button loading={createRequest.isLoading} type="submit">
              Nutzer anlegen
            </Button>
          </div>
        </div>
      </form>

      {createRequest.errored && (
        <span className="text-rot-100 absolute text-sm mt-3 block">
          {createRequest.errorMessage}
        </span>
      )}
      {userPassword && (
        <div className="mt-5 text-right rounded-sm text-base bg-blau-100 px-4 py-2">
          <p className="text-white">
            Nutzer wurde mit folgendem initialen Password angelegt:{" "}
            <span className="font-bold text-white">{userPassword}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateUserForm;
