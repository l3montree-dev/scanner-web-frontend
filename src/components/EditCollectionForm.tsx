import { Collection, ShareLink } from "@prisma/client";
import React, { FunctionComponent, useEffect, useState } from "react";

import useLoading from "../hooks/useLoading";
import { colors } from "../utils/common";
import { DTO } from "../utils/server";
import Button from "./Button";
import FormInput from "./FormInput";
import Menu from "./Menu";
import ShareLinkItem from "./ShareLinkItem";

interface Props {
  onSubmit: (collection: {
    id: number;
    color: string;
    title: string;
  }) => Promise<void>;
  onGenerateLink: (collectionId: number) => Promise<void>;
  collection: DTO<Collection & { shareLinks: ShareLink[] }>;
  onShareLinkDelete: (shareLink: DTO<ShareLink>) => Promise<void>;
}
const EditCollectionForm: FunctionComponent<Props> = (props) => {
  const submitRequest = useLoading();
  const generateLinkRequest = useLoading();
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
        <div className="flex flex-row justify-between items-end">
          <Menu
            menuCloseIndex={1}
            buttonClassNames={
              "flex flex-row w-full hover:bg-deepblue-50 transition-all"
            }
            Button={
              <div className="flex flex-row p-1 pr-3 border border-deepblue-50 items-center gap-5">
                <div className="w-9 h-9" style={{ backgroundColor: color }} />
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

          <Button
            spinnerColor="white"
            className="bg-deepblue-100 h-full font-medium text-white hover:bg-deepblue-200 transition-all px-3 py-2 text-center"
            loading={submitRequest.isLoading}
            type="submit"
          >
            Speichern
          </Button>
        </div>
        <div className="mt-5 text-white">
          <div className="text-white">Links</div>
          <p className="text-sm">
            Mit diesen Links ist ein lesender Zugriff auf die Sammlung möglich.
          </p>
          <div className="flex flex-col flex-wrap mt-1 mb-3 gap-2">
            {props.collection.shareLinks.length === 0 && (
              <div className="border border-deepblue-50 p-5 text-center flex-1">
                <span className="text-white">Keine Links erstellt</span>
              </div>
            )}
            {props.collection.shareLinks.map((shareLink) => {
              return (
                <ShareLinkItem
                  onDelete={props.onShareLinkDelete}
                  key={shareLink.secret}
                  shareLink={shareLink}
                />
              );
            })}
          </div>
          <div className="flex flex-row justify-end">
            <Button
              onClick={() =>
                generateLinkRequest.run(
                  props.onGenerateLink(props.collection.id)
                )
              }
              loading={generateLinkRequest.isLoading}
              type="button"
              spinnerColor="white"
              className="bg-deepblue-50 px-3 py-2"
            >
              <span className="text-white">Neuen Link generieren</span>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditCollectionForm;
