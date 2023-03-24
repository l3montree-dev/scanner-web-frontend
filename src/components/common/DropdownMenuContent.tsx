import { Content } from "@radix-ui/react-dropdown-menu";

import { ComponentProps, forwardRef, FunctionComponent } from "react";

// eslint-disable-next-line react/display-name
const DropdownMenuContent = forwardRef<any, any>((props, ref) => {
  return (
    <Content
      ref={ref}
      sideOffset={5}
      className="DropdownMenuContent overflow-hidden bg-deepblue-200 py-1 z-50  border border-deepblue-50 rounded-md text-white"
      {...props}
    ></Content>
  );
});

export default DropdownMenuContent;
