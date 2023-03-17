import {
  faArrowLeft,
  faArrowLeftLong,
  faChartLine,
  faLeftLong,
  faListCheck,
  faNetworkWired,
  faTag,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
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
    path: "/dashboard/targets",
  },
  {
    icon: faTag,
    name: "Sammlungen",
    path: "/dashboard/collections",
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
    {
      icon: faNetworkWired,
      name: "Netzwerkverwaltung",
      path: "/administration/networks",
    },
  ]);
};
const SideNavigation = () => {
  const session = useSession();

  const { pathname } = useRouter();

  return (
    <div className="bg-deepblue-700 border-r border-deepblue-300 h-full">
      <div className="sticky top-14 pt-10">
        <div>
          {getLinks(isAdmin(session.data)).map(({ path, name, icon }) => (
            <Link key={name} href={path}>
              <div
                className={classNames(
                  "py-2 px-4 m-2 flex flex-row border hover:bg-deepblue-300 transition-all hover:text-white cursor-pointer",
                  pathname === path
                    ? "bg-deepblue-300 border border-deepblue-300 text-white"
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideNavigation;
