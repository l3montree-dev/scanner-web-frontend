import {
  faArrowRight,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { FunctionComponent } from "react";
import DropdownSubMenuContent from "./DropdownSubMenuContent";

interface Props {
  Button: React.ReactNode;
  Menu: React.ReactNode;
}

const SubMenu: FunctionComponent<Props> = ({ Button, Menu }) => {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <div className="lg:px-2 px-2 py-1 mx-1 rounded-sm cursor-pointer hover:bg-lightning-500 flex flex-row items-center justify-between gap-2 focus:text-deepblue-500 hover:text-deepblue-500">
          {Button}
          <FontAwesomeIcon
            fontSize={15}
            className={"opacity-75"}
            icon={faChevronRight}
          />
        </div>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownSubMenuContent>{Menu}</DropdownSubMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};

export default SubMenu;
