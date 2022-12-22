import { FunctionComponent, PropsWithChildren } from "react";

interface Props {
  tooltip: string;
}
const Tooltip: FunctionComponent<PropsWithChildren<Props>> = (props) => {
  return (
    <div className="tooltip-container relative cursor-pointer inline">
      {props.children}
      <div className="tooltip p-2 z-10 bg-deepblue-200 border border-deepblue-100 opacity-0 left-0 absolute transition-all scale-50 origin-top-left text-sm">
        {props.tooltip}
      </div>
    </div>
  );
};

export default Tooltip;
