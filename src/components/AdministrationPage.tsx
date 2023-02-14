import { signIn } from "next-auth/react";
import React, { FunctionComponent, useEffect } from "react";
import { useSession } from "../hooks/useSession";
import DashboardPage from "./DashboardPage";
import { Props as MetaProps } from "./Meta";

interface Props extends MetaProps {
  children: [React.ReactNode, React.ReactNode];
  keycloakIssuer: string;
}
const AdministrationPage: FunctionComponent<Props> = (props) => {
  const { children, ...rest } = props;
  const [left, main] = React.Children.toArray(children);

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn("keycloak"); // Force sign in to hopefully resolve error
    }
  }, [session]);
  return (
    <DashboardPage {...rest}>
      {left}
      {main}
    </DashboardPage>
  );
};

export default AdministrationPage;
