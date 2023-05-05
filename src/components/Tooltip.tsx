import * as Popover from "@radix-ui/react-popover";
import { FunctionComponent, PropsWithChildren } from "react";

interface Props {
  tooltip: string | JSX.Element;
}
const Tooltip: FunctionComponent<PropsWithChildren<Props>> = (props) => {
  return (
    <Popover.Root>
      <Popover.Trigger aria-label="Hilfe öffnen">
        {props.children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="TooltipContent text-sm lg:w-72 w-56 bg-hellgrau-20 border border-dunkelgrau-40 z-200 m-1 text-textblack p-2"
          sideOffset={5}
        >
          {props.tooltip}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Tooltip;
