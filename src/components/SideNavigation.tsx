"use client";
import {
  faArrowLeftLong,
  faChartLine,
  faGaugeHigh,
  faInfo,
  faListCheck,
  faSquareCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FunctionComponent, useEffect } from "react";
import { ISession } from "../types";
import { classNames, isAdmin, isGuestUser } from "../utils/common";
import { useGlobalStore } from "../zustand/global";
import { getLinks } from "./links";

const SideNavigation: FunctionComponent<{
  session: ISession;
}> = ({ session }) => {
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

  const pathname = usePathname();

  if (store.sideMenuCollapsed === null) {
    return null;
  }

  return (
    <div
      className={classNames(
        "lg:bg-white transition-all relative border-r-6 text-base border-hellgrau-40 lg:h-full",
        store.sideMenuCollapsed ? "w-16" : "w-80"
      )}
    >
      <div className="md:sticky top-5">
        <div className="pt-5 m-2 hidden lg:flex text-center items-start mb-5 text-white">
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

        <div>
          {getLinks(isGuestUser(session?.user), isAdmin(session)).map(
            ({ path, name, icon }) => (
              <Link key={name} className="hover:no-underline" href={path}>
                <div
                  className={classNames(
                    "py-3 lg:py-5 lg:px-5  flex flex-row items-center lg:hover:bg-hellgrau-20 hover:text-bund lg:hover:text-blau-100 hover:underline lg:hover:no-underline transition-all border-b cursor-pointer",
                    pathname === path
                      ? "text-bund lg:text-blau-100"
                      : "text-textblack"
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
          aria-label="Menü aus- oder einklappen"
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
