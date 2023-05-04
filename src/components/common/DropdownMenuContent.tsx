import { Content } from "@radix-ui/react-dropdown-menu";

import { ComponentProps, forwardRef, FunctionComponent } from "react";

// eslint-disable-next-line react/display-name
const DropdownMenuContent = forwardRef<any, any>((props, ref) => {
  return (
    <Content
      ref={ref}
      sideOffset={5}
      className="DropdownMenuContent text-sm border border-dunkelgrau-60 overflow-hidden bg-hellgrau-40 py-1 z-50 text-white"
      {...props}
    ></Content>
  );
});

export default DropdownMenuContent;
