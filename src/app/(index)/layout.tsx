import { FunctionComponent, PropsWithChildren } from "react";
import BPAHeader from "../../components/bpa/BPAHeader";
import { GlobalStoreProvider } from "../../zustand/GlobalStoreProvider";
import { authOptions } from "../../nextAuthOptions";
import { getSessionAndUser } from "../../utils/server";

const Layout = async ({ children }: any) => {
  const { session, user } = await getSessionAndUser(authOptions);
  return (
    <GlobalStoreProvider session={session} user={user}>
      <div id="index-layout">
        <BPAHeader />
        <main>{children}</main>
      </div>
    </GlobalStoreProvider>
  );
};

export default Layout;
