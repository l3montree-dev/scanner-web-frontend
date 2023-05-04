import React, { FunctionComponent, PropsWithChildren } from "react";
import Footer from "./Footer";
import BPAHeader from "./bpa/BPAHeader";

interface Props extends PropsWithChildren {
  hideLogin?: boolean;
}
const Page: FunctionComponent<Props> = (props) => {
  return (
    <div className="min-h-screen text-base flex flex-col">
      <BPAHeader hideLogin={props.hideLogin} />
      <main className="flex flex-1">{props.children}</main>
      <Footer />
    </div>
  );
};

export default Page;
