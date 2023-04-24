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
        backgroundColor: props.color,
      }}
      className={classNames(
        "flex items-center rounded-full px-2 py-1",
        adaptiveTextColorBasedOnContrast(props.color)
      )}
    >
      {props.children}
    </div>
  );
};

export default CollectionDataPill;
