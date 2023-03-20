import { Collection } from "@prisma/client";
import React, { FunctionComponent, useEffect, useState } from "react";

import useLoading from "../hooks/useLoading";
import { DTO } from "../utils/server";
import Button from "./Button";
import FormInput from "./FormInput";
import Menu from "./Menu";
import { colors } from "../utils/common";

interface Props {
  onSubmit: (collection: {
    id: number;
    color: string;
    title: string;
  }) => Promise<void>;
  collection: DTO<Collection>;
}
const EditCollectionForm: FunctionComponent<Props> = (props) => {
  const submitRequest = useLoading();
  const [title, setTitle] = useState(props.collection.title);
  const [color, setColor] = useState(props.collection.color);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.length === 0) return;
    submitRequest.loading();
    try {
      await props.onSubmit({
        id: props.collection.id,
        title: title,
        color: color,
      });
    } finally {
      submitRequest.success();
    }
  };

  useEffect(() => {
    setTitle(props.collection.title);
    setColor(props.collection.color);
  }, [props.collection]);

  return (
    <form className="justify-between  items-end" onSubmit={handleSubmit}>
      <div className="flex gap-2 flex-1 z-30 flex-col">
        <div className="flex-1">
          <FormInput
            value={title}
            placeholder="Sammlung"
            onChange={(e) => setTitle(e)}
            label="Name der Sammlung"
          />
        </div>
        <Menu
          menuCloseIndex={1}
          buttonClassNames={"flex flex-row"}
          Button={
            <div className="flex flex-row items-center gap-5">
              <div className="w-10 h-10" style={{ backgroundColor: color }} />
              <span className="text-white">Farbe</span>
            </div>
          }
          Menu={
            <div className="grid grid-cols-3 bg-deepblue-50 flex-wrap gap-1 p-2 justify-around items-center">
              {colors.map((color) => (
                <div
                  data-closemenu
                  onClick={() => setColor(color)}
                  key={color}
                  className="w-11 h-11 cursor-pointer hover:opacity-50 transition-all "
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          }
        />
      </div>
      <div className="flex flex-row justify-end">
        <Button
          spinnerColor="white"
          className="bg-deepblue-100 font-medium text-white hover:bg-deepblue-200 transition-all px-3 py-2 text-center"
          loading={submitRequest.isLoading}
          type="submit"
        >
          Speichern
        </Button>
      </div>
    </form>
  );
};

export default EditCollectionForm;
