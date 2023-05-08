import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { FunctionComponent } from "react";
import DropdownMenuContent from "./DropdownMenuContent";

interface Props {
  Button: React.ReactNode;
  Menu: React.ReactNode;
  disabled?: boolean;
}

const Menu: FunctionComponent<Props> = ({ Button, Menu, disabled }) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger ref={buttonRef} asChild disabled={disabled}>
        {Button}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenuContent>
          <div
            style={{
              minWidth: buttonRef.current?.clientWidth,
            }}
          >
            {Menu}
          </div>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default Menu;
