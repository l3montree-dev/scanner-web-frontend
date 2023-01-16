import React, { FunctionComponent, PropsWithChildren } from "react";
import Button from "./Button";

interface Props extends PropsWithChildren {
  loading: boolean;
  className?: string;
  onClick?: () => void;
  type: "button" | "submit" | "reset";
}

const PrimaryButton: FunctionComponent<Props> = ({
  loading,
  className,
  onClick,
  type,
  children,
}) => {
  return (
    <Button
      onClick={onClick}
      loading={loading}
      type={type ?? "submit"}
      className={
        className ??
        "bg-lightning-500 text-sm sm:text-base p-2 sm:p-3 hover:bg-lightning-900 font-bold leading-4 transition-all"
      }
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
