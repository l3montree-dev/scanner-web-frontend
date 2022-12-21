import React, { FunctionComponent, PropsWithChildren } from "react";
import Spinner from "./Spinner";

interface Props extends PropsWithChildren {
  loading: boolean;
  className?: string;
  onClick?: () => void;
  type: "button" | "submit" | "reset";
  spinnerSize?: number;
  spinnerColor?: string;
}
const Button: FunctionComponent<Props> = (props) => {
  const { loading, ...rest } = props;
  return (
    <button {...rest}>
      <div className="flex flex-row items-center">
        {loading && (
          <div className="flex mr-2 -my-10 flex-row items-center">
            <Spinner color={props.spinnerColor} size={props.spinnerSize} />
          </div>
        )}
        {props.children}
      </div>
    </button>
  );
};

export default Button;
