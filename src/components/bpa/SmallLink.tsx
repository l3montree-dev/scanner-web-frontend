import Link from "next/link";
import React, { FunctionComponent } from "react";

interface Props {
  href: string;
  children: string;
}
const SmallLink: FunctionComponent<Props> = (props) => {
  return (
    <Link className="uppercase" href={props.href}>
      <small>{props.children}</small>
    </Link>
  );
};

export default SmallLink;
