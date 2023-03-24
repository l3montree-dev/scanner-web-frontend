import { Content, SubContent } from "@radix-ui/react-dropdown-menu";

import { ComponentProps, FunctionComponent } from "react";

const DropdownSubMenuContent: FunctionComponent<
  ComponentProps<typeof Content>
> = (props) => {
  return (
    <SubContent
      className="DropdownMenuContent overflow-hidden bg-deepblue-200 py-1 z-50  rounded-md text-white"
      {...props}
    ></SubContent>
  );
};

export default DropdownSubMenuContent;
