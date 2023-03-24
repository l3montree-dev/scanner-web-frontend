import {
  faCaretDown,
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
import CollectionMenuContent from "../../components/CollectionMenuContent";
import CollectionPill from "../../components/CollectionPill";
import Button from "../../components/common/Button";
import Menu from "../../components/common/Menu";
import LineCharts from "../../components/dashboard/LineCharts";
import PieCharts from "../../components/dashboard/PieCharts";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Meta from "../../components/Meta";
import PageTitle from "../../components/PageTitle";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
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
  collectionId,
  dateFormat,
  Normalized,
  normalizeToMap,
  replaceNullWithZero,
} from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import { displayInspections, tailwindColors } from "../../utils/view";

interface Props {
  dashboard: IDashboard;
  keycloakIssuer: string;
  defaultCollectionId: number;
  collections: Normalized<DTO<Collection & { size: number }>>;
  refCollections: number[]; // the collections which were defined using environment variables
}

const localizeDefaultCollection = <
  T extends { id: number; title: string; color: string }
>(
  collection: T,
  defaultCollectionId: number,
  username: string
): T => {
  if (collection.id === defaultCollectionId) {
    return {
      ...collection,
      color: tailwindColors.lightning["500"],
      title: username,
    };
  }

  return collection;
};

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

  useEffect(() => {
    setData(currentStat);
  }, [currentStat]);

  const dataPerInspection = useMemo(
    () =>
      Object.fromEntries(
        displayInspections.map((key) => {
          const data = Object.fromEntries(
            Object.entries(dashboard.historicalData).map(
              ([collectionId, stat]) => {
                return [
                  collectionId,
                  localizeDefaultCollection(
                    {
                      id: parseInt(collectionId),
                      title: stat!.title,
                      color: stat!.color,
                      series: stat!.series.map((item) => {
                        return {
                          y: item.data[key] * 100,
                          x: new Date(item.date).toLocaleDateString(
                            "de-DE",
                            dateFormat
                          ),
                        };
                      }),
                    },
                    props.defaultCollectionId,
                    user.data?.user.name || "Meine"
                  ),
                ];
              }
            )
          );

          const min = Math.min(
            ...Object.values(data)
              .map((item) => item.series)
              .flat()
              .map((item) => item.y)
          );
          const max = Math.max(
            ...Object.values(data)
              .map((item) => item.series)
              .flat()
              .map((item) => item.y)
          );

          return [
            key,
            {
              data,
              min,
              max,
            },
          ];
        })
      ),
    [dashboard.historicalData, user.data]
  );

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

      <div className="flex-row min-h-screen flex w-full flex-1">
        <div>
          <SideNavigation />
        </div>
        <div className="flex-1 flex flex-col">
          <Header keycloakIssuer={props.keycloakIssuer} />
          <main className="bg-deepblue-600 flex-col flex flex-1">
            <div className="max-w-screen-xl w-full mb-5 pt-10 mx-auto">
              <div className="text-white mb-0 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-4xl text-white font-bold"
                  stringRep="Dashboard"
                >
                  Dashboard
                </PageTitle>
                <Tooltip
                  tooltip={`         
                    Das Dashboard zeigt Ihnen aggregierte Informationen über den
                    Sicherheitszustand der von Ihnen verwalteten
                    OZG-Dienste. Ausschliesslich erreichbare Domains können
                    getestet werden. Die Anfrage muss vom Server in maximal zehn
                    Sekunden beantwortet werden, damit eine Domain als
                    erreichbar gilt. Derzeit sind ${currentStat.totalCount} von ${dashboard.totals.uniqueTargets} Domains erreichbar.`}
                >
                  <div className="text-slate-400">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </div>
            </div>
            {!isGuest && (
              <div className="text-white sticky z-20 beneath-header p-2 bg-deepblue-300 flex flex-row mb-4 items-center">
                <div className="max-w-screen-xl gap-2 flex flex-row flex-1 mx-auto">
                  <div className="flex flex-row">
                    <Menu
                      Button={
                        <Button
                          RightIcon={
                            <FontAwesomeIcon
                              className="ml-2"
                              icon={faCaretDown}
                            />
                          }
                        >
                          Gruppen anzeigen
                        </Button>
                      }
                      Menu={
                        <CollectionMenuContent
                          selectedCollections={displayCollections}
                          onCollectionClick={({ id }) => {
                            handleDisplayCollectionToggle(id);
                          }}
                          collections={Object.fromEntries(
                            Object.entries(props.collections).map(
                              ([collectionId, c]) => [
                                collectionId,
                                localizeDefaultCollection(
                                  c,
                                  props.defaultCollectionId,
                                  user.data?.user.name || "Meine"
                                ),
                              ]
                            )
                          )}
                        />
                      }
                    />
                  </div>
                  <div className="flex flex-wrap flex-row gap-2 items-center justify-start">
                    {displayCollections.map((id) => {
                      const col = props.collections[id];
                      if (!col) {
                        return null;
                      }
                      return (
                        <CollectionPill
                          onRemove={() => {
                            handleDisplayCollectionToggle(id);
                          }}
                          key={col.id}
                          {...col}
                          title={
                            id === props.defaultCollectionId
                              ? `${user.data?.user.name || "Meine"} (${
                                  col.size
                                })`
                              : `${col.title} (${col.size})`
                          }
                          color={
                            id === props.defaultCollectionId
                              ? tailwindColors.lightning["500"]
                              : col.color
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="max-w-screen-xl pb-10 mx-auto flex-1 text-white">
              <div>
                <PieCharts
                  displayCollections={_displayCollections}
                  historicalData={dashboard.historicalData}
                  defaultCollectionId={props.defaultCollectionId}
                  currentStat={data as ChartData}
                />

                <LineCharts
                  displayCollections={_displayCollections}
                  displayInspections={displayInspections}
                  dataPerInspection={dataPerInspection}
                  defaultCollectionId={props.defaultCollectionId}
                />
              </div>
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
