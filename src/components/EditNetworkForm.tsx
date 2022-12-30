import { FormEvent, FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { INetwork } from "../types";
import { isValidIp, isValidMask } from "../utils/validator";
import Button from "./Button";
import FormTextarea from "./FormTextarea";
import PrimaryButton from "./PrimaryButton";

interface Props extends INetwork {
  onSubmit: (newComment: string) => Promise<void>;
  onDelete: () => Promise<void>;
}
const EditNetworkForm: FunctionComponent<Props> = (props) => {
  const request = useLoading();
  const deleteRequest = useLoading();

  const [comment, setComment] = useState(props.comment ?? "");

  const handleDelete = async () => {
    try {
      deleteRequest.loading();
      await props.onDelete();
      deleteRequest.success();
    } catch (e: any) {
      deleteRequest.error(e.toString());
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      request.loading();
      await props.onSubmit(comment);
      request.success();
    } catch (e: any) {
      request.error(e.toString());
    }
  };

  return (
    <div>
      <div className="text-white pt-5">
        Ausgewähltes Netzwerk: <b>{props.cidr}</b>
      </div>
      <form onSubmit={handleSubmit} className="pt-5  flex">
        <div className="flex flex-col flex-1">
          <div className="flex-col flex">
            <FormTextarea
              label="Kommentar"
              onChange={setComment}
              value={comment}
            />
          </div>
          <div className="flex flex-row justify-end mt-5">
            <Button
              className="bg-deepblue-50 text-white px-5 mr-3"
              type="button"
              onClick={handleDelete}
              loading={false}
            >
              Netzwerk löschen
            </Button>
            <PrimaryButton loading={request.isLoading} type="submit">
              Speichern
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

export default EditNetworkForm;