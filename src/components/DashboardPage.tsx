import React, { FunctionComponent } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Meta, { Props as MetaProps } from "./Meta";

interface Props extends MetaProps {
  children: [React.ReactNode, React.ReactNode];
  keycloakIssuer: string;
}
const DashboardPage: FunctionComponent<Props> = (props) => {
  const { children, ...rest } = props;
  const [left, main] = React.Children.toArray(children);

  return (
    <>
      <Meta {...rest} />

      <div className="flex-row min-h-screen flex w-full flex-1">
        <div>{left}</div>
        <div className="flex-1 flex flex-col">
          <Header keycloakIssuer={props.keycloakIssuer} />
          <main className="p-10 bg-deepblue-600 flex flex-1">
            <div className="max-w-screen-xl flex-1 mx-auto">{main}</div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;
