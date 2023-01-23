import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useState } from "react";
import { classNames } from "../utils/common";

interface Props {
  checked: boolean;
  onChange: () => void;
}
const Checkbox: FunctionComponent<Props> = (props) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        props.onChange();
      }}
      className={classNames(
        "w-5 h-5 flex flex-row cursor-pointer items-center rounded-sm justify-center",
        props.checked ? "bg-lightning-500" : "bg-deepblue-100"
      )}
    >
      {props.checked && (
        <FontAwesomeIcon className="text-deepblue-500" icon={faCheck} />
      )}
    </div>
  );
};

export default Checkbox;
