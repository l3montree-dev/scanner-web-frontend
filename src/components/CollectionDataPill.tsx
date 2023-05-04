import { FunctionComponent, PropsWithChildren } from "react";
import { classNames } from "../utils/common";
import { adaptiveTextColorBasedOnContrast } from "../utils/view";

interface Props {
  color: string;
  title: string;
}
const CollectionDataPill: FunctionComponent<PropsWithChildren<Props>> = (
  props
) => {
  return (
    <div
      style={{
        borderColor: props.color,
      }}
      className={classNames(
        "flex items-center border bg-white px-2 py-1",
        adaptiveTextColorBasedOnContrast(props.color)
      )}
    >
      {props.children}
    </div>
  );
};

export default CollectionDataPill;
