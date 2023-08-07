import { FunctionComponent, PropsWithChildren } from "react";
import BPAHeader from "../../components/bpa/BPAHeader";
import { GlobalStoreProvider } from "../../zustand/GlobalStoreProvider";

const Layout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <GlobalStoreProvider>
      <div id="index-layout">
        <BPAHeader />
        <main>{children}</main>
      </div>
    </GlobalStoreProvider>
  );
};

export default Layout;
