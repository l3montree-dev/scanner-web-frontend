import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { FunctionComponent } from "react";
import DropdownMenuContent from "./DropdownMenuContent";

interface Props {
  Button: React.ReactNode;
  Menu: React.ReactNode;
  disabled?: boolean;
}

const Menu: FunctionComponent<Props> = ({ Button, Menu, disabled }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        {Button}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenuContent>{Menu}</DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Menu;
