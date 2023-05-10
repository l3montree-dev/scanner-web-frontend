import { FunctionComponent, PropsWithChildren } from "react";
import BPAHeader from "../../components/bpa/BPAHeader";

const Layout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div id="index-layout">
      <BPAHeader />
      {children}
    </div>
  );
};

export default Layout;
