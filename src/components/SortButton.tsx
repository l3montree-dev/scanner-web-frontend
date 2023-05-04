import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent } from "react";
import { classNames } from "../utils/common";

export const SortButton: FunctionComponent<{
  sortKey: "uri";
  onSort: (key: "uri") => void;
  active: boolean;
  getIcon: () => IconProp;
}> = ({ sortKey: key, onSort, active, getIcon }) => {
  return (
    <button
      onClick={() => {
        onSort(key);
      }}
      className={classNames(
        "hover:bg-dunkelblau-100 ml-2 border border-hellgrau-100 bg-white rounded-sm transition-all w-8 h-8 hover:text-white",
        !active && "",
        active && "text-blau-100"
      )}
    >
      <FontAwesomeIcon icon={getIcon()} />
    </button>
  );
};
