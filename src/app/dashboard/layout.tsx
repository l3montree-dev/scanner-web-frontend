import React, { FunctionComponent, PropsWithChildren } from "react";
import Header from "../../components/Header";
import SideNavigation from "../../components/SideNavigation";
import { getServerSession } from "../../utils/server";
import { authOptions } from "../../nextAuthOptions";

type Props = PropsWithChildren;
const DashboardLayout = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    // should be catched by the middleware already
    return null;
  }
  return (
    <div id="dashboard-layout">
      <div className="flex-row min-h-screen text-base flex w-full flex-1">
        <div className="hidden lg:block">
          <SideNavigation session={session} />
        </div>
        <div className="flex-1 flex flex-col">
          <Header session={session} />
          <main className="py-10 text-base flex-col bg-white flex flex-1">
            <div className="max-w-screen-2xl md:px-8 px-4 w-full flex-1 mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
