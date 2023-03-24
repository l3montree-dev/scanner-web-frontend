import React, { forwardRef } from "react";
import { classNames } from "../../utils/common";
import Button from "./Button";

interface Props {
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  RightIcon?: React.ReactNode;
  LeftIcon?: React.ReactNode;
}
// eslint-disable-next-line react/display-name
const OutlineButton = forwardRef<
  HTMLButtonElement,
  Props &
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
>((props, ref) => {
  const { active, disabled, ...rest } = props;
  return (
    <Button
      className={classNames(
        "transition-all flex flex-row items-center gap-3 rounded-sm text-white border border-deepblue-50 shadow-md p-2 px-3 focus:bg-deepblue-50 hover:bg-deepblue-50/30",
        props.disabled && "opacity-50 cursor-not-allowed hover:bg-deepblue-100",
        props.active && "bg-deepblue-50",

        props.className
      )}
      {...rest}
      ref={ref}
    />
  );
});

export default OutlineButton;
