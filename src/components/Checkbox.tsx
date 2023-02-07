import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import { classNames } from "../utils/common";

interface Props {
  checked: boolean;
  onChange: () => void;
}
const Checkbox: FunctionComponent<Props> = (props) => {
  const [focused, setFocused] = useState(false);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        props.onChange();
      }}
      className={classNames(
        "w-5 h-5 flex flex-row cursor-pointer items-center rounded-sm justify-center",
        props.checked ? "bg-lightning-500" : "bg-deepblue-100",
        focused ? "outline outline-lightning-500" : ""
      )}
    >
      <input
        type={"checkbox"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        checked={props.checked}
        onChange={props.onChange}
        className={"opacity-0 absolute"}
      />
      {props.checked && (
        <FontAwesomeIcon className="text-deepblue-500" icon={faCheck} />
      )}
    </div>
  );
};

export default Checkbox;
