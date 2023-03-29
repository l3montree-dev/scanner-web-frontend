import * as Popover from "@radix-ui/react-popover";
import { FunctionComponent, PropsWithChildren } from "react";

interface Props {
  tooltip: string | JSX.Element;
}
const Tooltip: FunctionComponent<PropsWithChildren<Props>> = (props) => {
  return (
    <Popover.Root>
      <Popover.Trigger>{props.children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="TooltipContent w-56 bg-deepblue-100 z-200 text-white text-sm p-2 rounded-md"
          sideOffset={5}
        >
          {props.tooltip}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Tooltip;
