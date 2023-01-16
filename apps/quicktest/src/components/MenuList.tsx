import React, { FunctionComponent } from "react";
import { classNames } from "../utils/common";

interface Props {
  children: React.ReactNode;
}
const MenuList: FunctionComponent<Props> = (props) => {
  const arr = React.Children.toArray(props.children);
  return (
    <div className="bg-deepblue-100 border border-deepblue-50 shadow-lg">
      {arr.map((child, index) => {
        return (
          <div
            key={index}
            className={classNames(
              index + 1 !== arr.length && "border-b",
              "border-deepblue-50"
            )}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default MenuList;
