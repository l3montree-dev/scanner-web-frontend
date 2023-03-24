import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { classNames } from "../utils/common";
import * as BaseTooltip from "@radix-ui/react-tooltip";

interface Props {
  tooltip: string | JSX.Element;
}
const Tooltip: FunctionComponent<PropsWithChildren<Props>> = (props) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [clNames, setClNames] = useState("left-0 origin-top-left");

  useEffect(() => {
    // check wether the tooltip is too far to the right
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      if (rect.right + rect.width > window.innerWidth) {
        setClNames("right-0 origin-right-left");
      } else {
        setClNames("left-0 origin-top-left");
      }
    }
  }, [props.tooltip]);

  return (
    <BaseTooltip.Provider>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger>{props.children}</BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Content
            className="TooltipContent w-56 bg-deepblue-100 z-200 text-white text-sm p-2 rounded-md"
            sideOffset={5}
          >
            {props.tooltip}
          </BaseTooltip.Content>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
};

export default Tooltip;
