import Link from "next/link";
import React, { FunctionComponent } from "react";

interface Props {
  href: string;
  children: string;
}
const SmallLink: FunctionComponent<Props> = (props) => {
  return (
    <Link
      className="uppercase font-bold text-sm text-dunkelgrau-100"
      href={props.href}
    >
      {props.children}
    </Link>
  );
};

export default SmallLink;
