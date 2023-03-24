import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CheckboxItem, ItemIndicator } from "@radix-ui/react-dropdown-menu";
import React, { ComponentProps, FunctionComponent } from "react";
import { classNames } from "../../utils/common";

const DropdownMenuCheckboxItem: FunctionComponent<
  ComponentProps<typeof CheckboxItem> & { Icon: React.ReactNode }
> = (props) => {
  const { Icon, ...rest } = props;
  return (
    <CheckboxItem
      className={classNames(
        "px-5 pl-8 py-1 cursor-pointer mx-1 my-1 rounded-sm focus:bg-lightning-500 text-white focus:text-deepblue-500 relative focus:outline-none",
        props.checked && "bg-deepblue-50"
      )}
      {...rest}
    >
      <ItemIndicator className="absolute opacity-75 left-2">
        {Icon}
      </ItemIndicator>
      {props.children}
    </CheckboxItem>
  );
};

export default DropdownMenuCheckboxItem;
