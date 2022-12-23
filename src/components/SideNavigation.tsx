import {
  faChartLine,
  faGauge,
  faListCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useSession } from "../hooks/useSession";
import { classNames, isAdmin } from "../utils/common";

const defaultLinks = [
  {
    icon: faChartLine,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: faListCheck,
    name: "Domainübersicht",
    path: "/dashboard/domains",
  },
];
const getLinks = (isAdmin: boolean) => {
  if (!isAdmin) {
    return defaultLinks;
  }
  return defaultLinks.concat([
    {
      icon: faUsers,
      name: "Nuterverwaltung",
      path: "/administration/users",
    },
  ]);
};
const SideNavigation = () => {
  const session = useSession();

  const { pathname } = useRouter();

  return (
    <div className="bg-deepblue-500 h-full">
      <div className="sticky top-0 pt-10">
        {getLinks(isAdmin(session.data)).map(({ path, name, icon }) => (
          <Link key={name} href={path}>
            <div
              className={classNames(
                "py-2 px-4 flex flex-row text-white hover:bg-deepblue-300 border-t border-b border-transparent transition-all cursor-pointer",
                pathname === path &&
                  "bg-deepblue-300 border-t border-b border-deepblue-500"
              )}
            >
              <div className="mr-2">
                <FontAwesomeIcon
                  className="opacity-75"
                  fontSize={20}
                  icon={icon}
                />
              </div>
              {name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SideNavigation;
