import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection } from "@prisma/client";
import React, { FunctionComponent, PropsWithChildren } from "react";
import tinycolor from "tinycolor2";
import { classNames } from "../utils/common";
import { DTO } from "../utils/server";

const clNames = (color: string) => {
  // check if the color is dark
  if (tinycolor(color).isDark()) {
    return "text-white";
  }
  return "text-deepblue-500";
};
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
        clNames(props.color)
      )}
    >
      {props.children}
    </div>
  );
};

export default CollectionDataPill;
