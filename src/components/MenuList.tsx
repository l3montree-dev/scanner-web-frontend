import React, { FunctionComponent } from "react";

interface Props {
  children: React.ReactNode;
}
const MenuList: FunctionComponent<Props> = (props) => {
  return (
    <div className="bg-deepblue-100 border border-deepblue-50 shadow-lg">
      {props.children}
    </div>
  );
};

export default MenuList;
