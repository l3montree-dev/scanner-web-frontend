import React, { FunctionComponent, PropsWithChildren } from "react";
import Footer from "./Footer";

interface Props extends PropsWithChildren {}
const Page: FunctionComponent<Props> = (props) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="bg-deepblue-500 flex-1">{props.children}</main>
      <Footer />
    </div>
  );
};

export default Page;
