import { Item } from "@radix-ui/react-dropdown-menu";
import { ComponentProps, FunctionComponent, ReactNode } from "react";
import { classNames } from "../../utils/common";
import Spinner from "../Spinner";

const DropdownMenuItem: FunctionComponent<
  ComponentProps<typeof Item> & {
    Icon?: ReactNode;
    active?: boolean;
    loading?: boolean;
  }
> = (props) => {
  const { Icon, active, loading, ...rest } = props;
  return (
    <Item
      className={classNames(
        "px-5 pl-8 py-1 cursor-pointer mx-1 my-1 rounded-sm focus:bg-lightning-500 text-white focus:text-deepblue-500 relative focus:outline-none",
        props.active && "bg-deepblue-50"
      )}
      {...rest}
    >
      {loading ? (
        <div className="absolute left-2 opacity-75">
          <Spinner />
        </div>
      ) : (
        Icon && <div className="absolute left-2 opacity-75">{props.Icon}</div>
      )}
      {props.children}
    </Item>
  );
};

export default DropdownMenuItem;