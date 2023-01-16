import React, { FunctionComponent, PropsWithChildren } from "react";
import Footer from "./Footer";

interface Props extends PropsWithChildren {
  hideLogin?: boolean;
}
const Page: FunctionComponent<Props> = (props) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="bg-deepblue-500 flex flex-1">{props.children}</main>
      <Footer hideLogin={props.hideLogin} />
    </div>
  );
};

export default Page;
