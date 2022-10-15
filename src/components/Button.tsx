import React, { FunctionComponent, PropsWithChildren } from "react";
import Spinner from "./Spinner";

interface Props extends PropsWithChildren {
  loading: boolean;
  className: string;
  onPress?: () => void;
  type: "button" | "submit" | "reset";
}
const Button: FunctionComponent<Props> = (props) => {
  const { loading, ...rest } = props;
  return (
    <button {...rest}>
      {loading ? (
        <div className="flex flex-row items-center">
          <Spinner />
          <span className="ml-2 hidden sm:inline">Test läuft...</span>
        </div>
      ) : (
        props.children
      )}
    </button>
  );
};

export default Button;
