import React, { forwardRef, FunctionComponent } from "react";
import { classNames } from "../../utils/common";
import Spinner from "../Spinner";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  RightIcon?: React.ReactNode;
  LeftIcon?: React.ReactNode;
  primary?: boolean;
}

const clNames = (primary: boolean = false) => {
  if (primary) {
    return "border-t-lightning-50 bg-lightning-500 focus:bg-lightning-300 hover:bg-lightning-300 font-bold text-deepblue-900";
  }
  return "text-white border-t-deepblue-50 bg-deepblue-100 focus:bg-deepblue-50 hover:bg-deepblue-50";
};
const Button =
  // eslint-disable-next-line react/display-name
  forwardRef<
    HTMLButtonElement,
    Props &
      React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >
  >((props, ref) => {
    const { loading, disabled, RightIcon, LeftIcon, ...rest } = props;

    return (
      <button
        ref={ref}
        className={classNames(
          "transition-all flex flex-row items-center gap-3 rounded-sm border-t p-2 px-3 ",
          clNames(props.primary),
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        {...rest}
        onClick={(e) => {
          if (props.disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          props.onClick?.(e);
        }}
      >
        {props.loading ? (
          <div className="opacity-50 -my-2 -mx-2">
            <Spinner size={35} />
          </div>
        ) : (
          props.LeftIcon && <div className="opacity-50">{props.LeftIcon}</div>
        )}
        {props.children}
        {props.RightIcon && <div className="opacity-50">{props.RightIcon}</div>}
      </button>
    );
  });

export default Button;
