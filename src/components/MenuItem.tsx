import React, { FunctionComponent } from "react";
import Spinner from "./Spinner";
interface Props {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}
const MenuItem: FunctionComponent<Props> = ({ children, onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 flex-row flex items-center px-4 hover:bg-deepblue-50 cursor-pointer w-full text-left"
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
