import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { classNames } from "../utils/common";

interface Props {
  tooltip: string;
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
    <div className="tooltip-container relative cursor-pointer inline">
      {props.children}
      <div
        ref={messageRef}
        className={classNames(
          "tooltip p-2 z-200 bg-deepblue-200 shadow-lg rounded-sm opacity-0 absolute transition-all scale-50 text-sm",
          clNames
        )}
      >
        {props.tooltip}
      </div>
    </div>
  );
};

export default Tooltip;
