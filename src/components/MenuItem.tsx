import React, { FunctionComponent } from "react";
import { classNames } from "../utils/common";
import Spinner from "./Spinner";
interface Props {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  selected?: boolean;
  closeMenu?: boolean;
}
const MenuItem: FunctionComponent<Props> = ({
  children,
  onClick,
  loading,
  selected,
  closeMenu,
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "p-2 flex-row flex items-center px-4 hover:bg-deepblue-50 cursor-pointer w-full text-left",
        selected && "bg-deepblue-50"
      )}
      {...(closeMenu ? { "data-closemenu": true } : {})}
    >
      {loading && (
        <div className="mr-2">
          <Spinner size={30} color="white" />
        </div>
      )}
      {children}
    </button>
  );
};

export default MenuItem;
