import React, { FunctionComponent, PropsWithChildren } from "react";
import { classNames } from "../utils/common";
import Button from "./Button";

interface Props extends PropsWithChildren {
  loading: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type: "button" | "submit" | "reset";
}

const PrimaryButton: FunctionComponent<Props> = ({
  loading,
  className,
  onClick,
  type,
  disabled,
  children,
}) => {
  return (
    <Button
      onClick={
        disabled
          ? (e) => {
              e.preventDefault();
            }
          : onClick
      }
      loading={loading}
      type={type ?? "submit"}
      className={
        className ??
        classNames(
          "bg-lightning-500 text-sm sm:text-base p-2 sm:p-3 hover:bg-lightning-900 font-bold leading-4 transition-all",
          disabled && "opacity-50 cursor-not-allowed hover:bg-lightning-500"
        )
      }
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
