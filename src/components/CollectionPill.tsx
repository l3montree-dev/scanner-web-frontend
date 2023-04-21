import { Collection } from "@prisma/client";
import { FunctionComponent } from "react";
import { DTO } from "../utils/server";
import { classNames } from "../utils/common";
import { textCLNames } from "../utils/view";

interface Props extends DTO<Collection> {
  onClick?: (id: number) => void;
  selected: boolean;
}
const CollectionPill: FunctionComponent<Props> = ({
  id,
  color,
  title,
  onClick,
  selected,
}) => {
  return (
    <div
      onClick={() => {
        onClick?.(id);
      }}
      className={classNames(
        "flex bg-deepblue-300 cursor-pointer  flex-row items-center rounded-full text-sm px-2 py-1",
        selected ? textCLNames(color) : "border-2 border-slate-400"
      )}
      style={{ backgroundColor: selected ? color : undefined }}
    >
      {title}
    </div>
  );
};

export default CollectionPill;
