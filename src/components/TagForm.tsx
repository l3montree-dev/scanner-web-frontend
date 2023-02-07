import { Tag } from "@prisma/client";
import React, { FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { DTO } from "../utils/server";
import Button from "./Button";
import Menu from "./Menu";

interface Props {
  onCreate: (tag: { title: string; color: string }) => Promise<void>;
}

const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const TagForm: FunctionComponent<Props> = ({ onCreate }) => {
  const createRequest = useLoading();

  const [tagTitle, setTagTitle] = useState("");
  const [tagColor, setTagColor] = useState(colors[0]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        createRequest.loading();
        try {
          await onCreate({ title: tagTitle, color: tagColor });
        } finally {
          createRequest.success();
        }
      }}
    >
      <div className="flex items-center line-height-0 flex-row">
        <Menu
          menuCloseIndex={1}
          Button={
            <div
              className="w-9 mr-1 h-9 rounded-sm"
              style={{ backgroundColor: tagColor }}
            />
          }
          Menu={
            <div className="flex mb-2 bg-deepblue-50 p-2 flex-wrap gap-1 justify-between items-center">
              {colors.map((color) => (
                <div
                  onClick={() => setTagColor(color)}
                  key={color}
                  className="w-9 h-9 cursor-pointer hover:opacity-50 transition-all rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          }
        />
        <input
          value={tagTitle}
          onChange={(e) => setTagTitle(e.target.value)}
          placeholder="Neues Tag erstellen"
          className="px-3 py-2 text-sm outline-lightning-500 text-deepblue-500 w-56"
        />
      </div>
      <div className="flex text-sm flex-row justify-end">
        <Button
          className="bg-lightning-500 font-bold text-deepblue-500 hover:bg-lightning-800 transition-all px-3 py-2 mt-2 text-center"
          loading={createRequest.isLoading}
          type="submit"
        >
          Erstellen
        </Button>
      </div>
    </form>
  );
};

export default TagForm;
