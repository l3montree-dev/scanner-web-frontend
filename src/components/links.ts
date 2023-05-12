import {
  faSquareCheck,
  faGaugeHigh,
  faChartLine,
  faListCheck,
  faInfo,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

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
export const getLinks = (isGuest: boolean, isAdmin: boolean) => {
  if (isGuest) {
    return defaultLinks;
  } else if (!isAdmin) {
    return defaultLinks.concat({
      icon: faInfo,
      name: "Informationen zur OZG-Security-Challenge",
      path: "/dashboard/info",
    });
  }

  return defaultLinks.concat([
    /*{
        icon: faTag,
        name: "Domain-Gruppen",
        path: "/dashboard/collections",
      },*/
    {
      icon: faUsers,
      name: "Nutzerverwaltung",
      path: "/dashboard/users",
    },
    {
      icon: faInfo,
      name: "Informationen zur OZG-Security-Challenge",
      path: "/dashboard/info",
    },
  ]);
};
