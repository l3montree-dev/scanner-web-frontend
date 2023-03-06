import { FunctionComponent, useEffect, useState } from "react";
import useLoading from "../hooks/useLoading";
import Button from "./Button";
import FormInput from "./FormInput";
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
];

const CollectionForm: FunctionComponent<Props> = ({ onCreate }) => {
  const createRequest = useLoading();

  const [title, setTitle] = useState("");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    setColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  return (
    <form
      className="justify-between flex gap-2 flex-row items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (title.length === 0) return;
        createRequest.loading();
        try {
          await onCreate({ title: title, color: color });
          setTitle("");
        } finally {
          createRequest.success();
        }
      }}
    >
      <div className="flex items-end gap-2 flex-1 flex-row">
        <div className="flex-1">
          <FormInput
            value={title}
            placeholder="Sammlung"
            onChange={(e) => setTitle(e)}
            label="Sammlung erstellen"
          />
        </div>
        <Menu
          menuCloseIndex={1}
          buttonClassNames={"flex flex-row"}
          Button={
            <div className="w-10 h-10" style={{ backgroundColor: color }} />
          }
          Menu={
            <div className="flex bg-deepblue-50 flex-wrap gap-1 p-2 justify-around items-center">
              {colors.map((color) => (
                <div
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
      <Button
        className="bg-deepblue-100 font-medium text-white hover:bg-deepblue-200 transition-all px-3 py-2 text-center"
        loading={createRequest.isLoading}
        type="submit"
      >
        Erstellen
      </Button>
    </form>
  );
};

export default CollectionForm;
