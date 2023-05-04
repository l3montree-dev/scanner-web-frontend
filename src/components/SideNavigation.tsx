import {
  faArrowLeftLong,
  faChartLine,
  faGaugeHigh,
  faInfo,
  faListCheck,
  faSquareCheck,
  faTag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession } from "../hooks/useSession";
import { classNames, isAdmin, isGuestUser } from "../utils/common";
import { useGlobalStore } from "../zustand/global";
import useWindowSize from "../hooks/useWindowSize";
import Logo from "./bpa/Logo";

const defaultLinks = [
  {
    icon: faSquareCheck,
    name: "Schnelltest",
    path: "/dashboard/quicktest",
  },
  {
    icon: faGaugeHigh,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: faChartLine,
    name: "Trendanalyse",
    path: "/dashboard/trends",
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
      name: "Domain-Gruppen",
      path: "/dashboard/collections",
    },
    {
      icon: faUsers,
      name: "Nutzerverwaltung",
      path: "/administration/users",
    },
    {
      icon: faInfo,
      name: "Informationen zur OZG-Security-Challenge",
      path: "/dashboard/info",
    },
  ]);
};

const SideNavigation = () => {
  const session = useSession();

  const store = useGlobalStore();
  const { width } = useWindowSize();

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
        "bg-white transition-all relative border-r-6 text-base border-hellgrau-40 lg:h-full",
        store.sideMenuCollapsed ? "w-16" : "w-80"
      )}
    >
      <div className="md:sticky top-5">
        <div className="pt-5 m-2 flex text-center items-start mb-5 text-white">
          {!store.sideMenuCollapsed && (
            <Link href={"/dashboard"}>
              <Image
                src={"/assets/BMI_de_v3__BSI_de_v1__Web_farbig.svg"}
                width={280}
                height={120}
                alt="Logo BMI und BSI"
              />
            </Link>
          )}
        </div>

        <div
          className={classNames(
            "flex transition-all ml-1 pt-5 lg:h-full items-center",
            store.sideMenuCollapsed ? "w-16" : "w-72"
          )}
        ></div>
        <div>
          {getLinks(isGuestUser(session.data?.user), isAdmin(session.data)).map(
            ({ path, name, icon }) => (
              <Link key={name} className="hover:no-underline" href={path}>
                <div
                  className={classNames(
                    "py-5 px-5  flex flex-row items-center hover:bg-hellgrau-20 hover:no-underline transition-all border-b cursor-pointer",
                    pathname === path ? "text-blau-100" : "text-textblack"
                  )}
                >
                  <div className="mr-4">
                    <FontAwesomeIcon className="w-5 h-5" icon={icon} />
                  </div>
                  <span
                    title={name}
                    className="whitespace-nowrap hover:no-underline overflow-hidden text-ellipsis"
                  >
                    {name}
                  </span>
                </div>
              </Link>
            )
          )}
        </div>
        <button
          onClick={handleCollapseToggle}
          className={classNames(
            "fixed hidden lg:flex left-3 bottom-5 p-2 rounded-full w-8 h-8 flex-row items-center justify-center  transition-all",
            store.sideMenuCollapsed ? "rotate-180" : ""
          )}
        >
          <FontAwesomeIcon icon={faArrowLeftLong} />
        </button>
      </div>
    </div>
  );
};

export default SideNavigation;
