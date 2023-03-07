import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection } from "@prisma/client";
import React, { FunctionComponent } from "react";
import { DTO } from "../utils/server";

interface Props extends DTO<Collection> {
  onRemove?: (id: number) => void;
}
const CollectionPill: FunctionComponent<Props> = ({
  id,
  color,
  title,
  onRemove,
}) => {
  return (
    <div className="flex bg-deepblue-300 border-deepblue-50 flex-row items-center border rounded-full text-xs px-2 py-1">
      <div
        className="w-3 h-3 border-deepblue-50 rounded-full inline-block mr-2"
        style={{
          backgroundColor: color,
        }}
      />
      {title}
      {onRemove && (
        <div
          className="ml-2 cursor-pointer"
          onClick={() => {
            onRemove(id);
          }}
        >
          <FontAwesomeIcon icon={faClose} />
        </div>
      )}
    </div>
  );
};

export default CollectionPill;
