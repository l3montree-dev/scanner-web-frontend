import {
  faArrowLeftLong,
  faChartLine,
  faListCheck,
  faNetworkWired,
  faTag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { classNames, isAdmin, isGuestUser } from "../utils/common";
import { useGlobalStore } from "../zustand/global";

const defaultLinks = [
  {
    icon: faChartLine,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: faListCheck,
    name: "Domainübersicht",
    path: "/dashboard/targets",
  },
];
const getLinks = (isGuest: boolean, isAdmin: boolean) => {
  if (isGuest) {
    return defaultLinks;
  } else if (!isAdmin) {
    return defaultLinks.concat({
      icon: faTag,
      name: "Gruppen",
      path: "/dashboard/collections",
    });
  }

  return defaultLinks.concat([
    {
      icon: faTag,
      name: "Gruppen",
      path: "/dashboard/collections",
    },
    {
      icon: faUsers,
      name: "Nuterverwaltung",
      path: "/administration/users",
    },
    {
      icon: faNetworkWired,
      name: "Netzwerkverwaltung",
      path: "/administration/networks",
    },
  ]);
};

const SideNavigation = () => {
  const session = useSession();

  const store = useGlobalStore();

  const handleCollapseToggle = () => {
    // save it inside local storage
    localStorage.setItem(
      "collapsed",
      !store.sideMenuCollapsed ? "true" : "false"
    );
    store.setSideMenuCollapsed(!store.sideMenuCollapsed);
  };

  useEffect(() => {
    if (localStorage.getItem("collapsed") === "true") {
      store.setSideMenuCollapsed(true);
    }
  }, []);

  const { pathname } = useRouter();

  if (store.sideMenuCollapsed === null) {
    return null;
  }

  return (
    <div
      className={classNames(
        "bg-deepblue-500 border-deepblue-300 transition-all relative h-full",
        store.sideMenuCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="sticky top-14 pt-10">
        <div>
          {getLinks(isGuestUser(session.data?.user), isAdmin(session.data)).map(
            ({ path, name, icon }) => (
              <Link key={name} href={path}>
                <div
                  className={classNames(
                    "py-2 px-3 m-2 flex flex-row border rounded-sm hover:bg-deepblue-300 transition-all hover:text-white cursor-pointer",
                    pathname === path
                      ? "bg-deepblue-100 border border-t border-t-deepblue-50 border-deepblue-300 text-white"
                      : "text-slate-400 border-transparent"
                  )}
                >
                  <div className="mr-4">
                    <FontAwesomeIcon
                      className="opacity-75"
                      fontSize={20}
                      icon={icon}
                    />
                  </div>
                  <span
                    title={name}
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {name}
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      <button
        onClick={handleCollapseToggle}
        className={classNames(
          "fixed right-0 bg-deepblue-100 left-4 bottom-5 p-2 rounded-full w-8 h-8 flex flex-row items-center justify-center text-white transition-all hover:bg-deepblue-50",
          store.sideMenuCollapsed ? "rotate-180" : ""
        )}
      >
        <FontAwesomeIcon icon={faArrowLeftLong} />
      </button>
    </div>
  );
};

export default SideNavigation;
