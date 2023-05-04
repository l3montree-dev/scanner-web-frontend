import {
  faCircleInfo,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection } from "@prisma/client";
import {
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import CollectionPill from "../../components/CollectionPill";
import EmptyDashboardNotice from "../../components/EmptyDashboardNotice";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Meta from "../../components/Meta";
import PageTitle from "../../components/PageTitle";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
import PieCharts from "../../components/dashboard/PieCharts";
import { config } from "../../config";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserOrGuestServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import { useIsGuest } from "../../hooks/useIsGuest";
import { useSession } from "../../hooks/useSession";
import { collectionService } from "../../services/collectionService";
import { statService } from "../../services/statService";
import { ChartData, IDashboard } from "../../types";
import {
  Normalized,
  classNames,
  collectionId,
  normalizeToMap,
  replaceNullWithZero,
} from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import { tailwindColors } from "../../utils/view";

interface Props {
  dashboard: IDashboard;
  keycloakIssuer: string;
  defaultCollectionId: number;
  collections: Normalized<DTO<Collection & { size: number }>>;
  refCollections: number[]; // the collections which were defined using environment variables
}

const Dashboard: FunctionComponent<Props> = (props) => {
  const dashboard = props.dashboard;
  const currentStat = useMemo(
    () =>
      props.defaultCollectionId in dashboard.historicalData
        ? dashboard.historicalData[props.defaultCollectionId]!.series[
            dashboard.historicalData[props.defaultCollectionId]!.series.length -
              1
          ]
        : ({
            totalCount: 0,
            data: {},
          } as ChartData),
    [dashboard.historicalData, props.defaultCollectionId]
  );
  const user = useSession();

  const [displayCollections, setDisplayCollections] = useState<number[]>(
    props.refCollections.concat(props.defaultCollectionId)
  );

  const [_, startTransition] = useTransition();
  const [_displayCollections, _setDisplayCollections] = useState(
    props.refCollections.concat(props.defaultCollectionId)
  );

  const [data, setData] = useState({
    totalCount: currentStat.totalCount,
    data: Object.fromEntries(
      Object.keys(currentStat.data).map((key) => [key, 0])
    ),
  });

  const noDomains = dashboard.totals.uniqueTargets === 0;

  useEffect(() => {
    setData(currentStat);
  }, [currentStat]);

  const handleDisplayCollectionToggle = (collectionId: number) => {
    if (displayCollections.includes(collectionId)) {
      // check if there is at least one collection left
      if (displayCollections.length === 1) {
        setDisplayCollections([props.defaultCollectionId]);
        startTransition(() => {
          _setDisplayCollections([props.defaultCollectionId]);
        });
        return;
      }
      setDisplayCollections((prev) => prev.filter((id) => id !== collectionId));
      startTransition(() => {
        _setDisplayCollections((prev) =>
          prev.filter((id) => id !== collectionId)
        );
      });
    } else {
      setDisplayCollections((prev) => prev.concat(collectionId));
      startTransition(() => {
        _setDisplayCollections((prev) => prev.concat(collectionId));
      });
    }
  };
  const isGuest = useIsGuest();

  return (
    <>
      <Meta title="Dashboard" />
      <div className="flex-row text-base min-h-screen flex w-full flex-1">
        <div className="hidden lg:block">
          <SideNavigation />
        </div>
        <div className="flex-1 flex flex-col">
          <Header keycloakIssuer={props.keycloakIssuer} />
          <main className="flex-col flex flex-1">
            <div className="max-w-screen-xl w-full mb-5 pt-10 mx-auto">
              <div className=" mb-0 px-3 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-2xl  font-bold"
                  stringRep="Dashboard"
                >
                  Dashboard
                </PageTitle>
                <Tooltip
                  tooltip={`         
                    Das Dashboard bietet eine Übersicht über den Sicherheitszustand von Domain-Gruppen.`}
                >
                  <div className="text-dunkelgrau-100">
                    <FontAwesomeIcon size="xl" icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </div>
            </div>

            {/*!isGuest && (
              <div className=" sticky z-20 bg-white border-b-6 border-hellgrau-40 beneath-header py-2 flex flex-row mb-4 items-center">
                <div className="max-w-screen-xl px-3 text-lg gap-1 flex flex-col flex-1 mx-auto">
                  <span className="font-semibold">
                    Domain-Gruppe (Anzahl der Domains)
                  </span>
                  <div className="flex flex-wrap flex-row gap-2 items-center justify-start">
                    {Object.values(props.collections).map((col) => {
                      // check if selected
                      const selected = displayCollections.includes(col.id);

                      return (
                        <CollectionPill
                          onClick={() => {
                            handleDisplayCollectionToggle(col.id);
                          }}
                          selected={selected}
                          key={col.id}
                          {...col}
                          title={
                            col.id === props.defaultCollectionId
                              ? `${user.data?.user.name || "Meine"} (${
                                  col.size
                                })`
                              : `${col.title} (${col.size})`
                          }
                          color={
                            col.id === props.defaultCollectionId
                              ? tailwindColors.blau["100"]
                              : col.color
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
                )*/}

            <div
              className={classNames(
                noDomains && "relative pointer-events-none"
              )}
            >
              <div
                className={classNames(
                  "max-w-screen-xl pb-10 mx-auto px-3 flex-1 ",
                  noDomains && "blur-sm"
                )}
              >
                <PieCharts
                  displayCollections={_displayCollections}
                  historicalData={dashboard.historicalData}
                  defaultCollectionId={props.defaultCollectionId}
                  currentStat={data as ChartData}
                />
              </div>
              {noDomains && (
                <div className="absolute pointer-events-auto z-90 mt-10 top-0 flex flex-row justify-center left-0 right-0 mb-10 px-3 flex-1">
                  <div className="border-blue-500/20 p-5 flex flex-row bg-hellorange-100 max-w-screen-lg text-deepblue-500">
                    <div className="pr-3 pt-1">
                      <FontAwesomeIcon size={"lg"} icon={faCircleInfo} />
                    </div>
                    <EmptyDashboardNotice />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (_context, [currentUser, prisma]): Promise<ServerSideProps<Props>> => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [dashboard, referenceChartData, collections] = await Promise.all([
      statService.getDashboardForUser(currentUser, prisma),
      statService.getReferenceChartData(prisma),
      collectionService.getAllCollectionsOfUser(currentUser, prisma, true),
    ]);

    return {
      props: {
        dashboard: replaceNullWithZero({
          ...dashboard,
          historicalData: {
            ...dashboard.historicalData,
            ...referenceChartData,
          },
        }),
        keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
        defaultCollectionId: collectionId(currentUser),
        refCollections: config.generateStatsForCollections,
        collections: normalizeToMap(
          toDTO(collections).map((c) => ({ ...c, size: c._count.targets })),
          "id"
        ),
      },
    };
  },
  withCurrentUserOrGuestServerSideProps,
  withDB
);

export default Dashboard;
