import React, { FunctionComponent } from "react";
import Footer from "./Footer";

interface Props {
  children: [React.ReactNode, React.ReactNode];
}
const DashboardPage: FunctionComponent<Props> = ({ children }) => {
  const [left, main] = React.Children.toArray(children);
  return (
    <div className="flex-row min-h-screen flex w-full flex-1">
      <div className="w-64">{left}</div>
      <div className="flex-1 flex flex-col">
        <main className="p-10  bg-deepblue-500 flex flex-1">{main}</main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
