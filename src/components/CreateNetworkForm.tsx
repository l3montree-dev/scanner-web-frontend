import React, { FormEvent, FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { parseNetworkString } from "../utils/common";
import { isValidIp, isValidMask } from "../utils/validator";
import FormTextarea from "./FormTextarea";
import PrimaryButton from "./PrimaryButton";

interface Props {
  onSubmit: (networks: string[]) => Promise<void>;
}
const CreateNetworkForm: FunctionComponent<Props> = ({ onSubmit }) => {
  const request = useLoading();

  const [networks, setNetworks] = useState("");
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const n = parseNetworkString(networks);
      request.loading();
      await onSubmit(n);
      request.success();
    } catch (e: any) {
      request.error(e.toString());
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="pt-10  flex">
        <div className="flex flex-col flex-1">
          <div className="flex-col flex">
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
            <PrimaryButton loading={request.isLoading} type="submit">
              Netzwerke dem System hinzufügen
            </PrimaryButton>
          </div>
        </div>
      </form>

      {request.errored && (
        <span className="text-red-600 absolute text-sm mt-3 block">
          {request.errorMessage}
        </span>
      )}
    </div>
  );
};

export default CreateNetworkForm;
