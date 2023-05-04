import {
  faCircleInfo,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection } from "@prisma/client";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import React, {
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
import LineCharts from "../../components/dashboard/LineCharts";
import { config } from "../../config";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserOrGuestServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import { useIsGuest } from "../../hooks/useIsGuest";
import { useSession } from "../../hooks/useSession";
import useWindowSize from "../../hooks/useWindowSize";
import { collectionService } from "../../services/collectionService";
import { statService } from "../../services/statService";
import { ChartData, Guest, IDashboard } from "../../types";
import {
  Normalized,
  classNames,
  collectionId,
  dateFormat,
  isAdmin,
  normalizeToMap,
  replaceNullWithZero,
} from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import { displayInspections, tailwindColors } from "../../utils/view";
import {
  withSession,
  withSessionServerSideProps,
} from "../../decorators/withSession";

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
      color: tailwindColors.blau["100"],
      title: username,
    };
  }

  return collection;
};

const Dashboard: FunctionComponent<Props> = (props) => {
  const [zoomLevel, setZoomLevel] = React.useState(2);
  const { width } = useWindowSize();

  useEffect(() => {
    if (width < 768 && width > 0) {
      setZoomLevel(2);
    }
  }, [width]);

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
    [dashboard.historicalData, user.data, props.defaultCollectionId]
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
      <Meta title="Trendanalyse" />
      <div className="flex-row min-h-screen flex w-full flex-1">
        <div className="hidden lg:block">
          <SideNavigation />
        </div>
        <div className="flex-1 flex flex-col">
          <Header keycloakIssuer={props.keycloakIssuer} />
          <main className=" flex-col flex flex-1">
            <div className="max-w-screen-xl w-full mb-5 pt-10 mx-auto">
              <div className=" mb-0 px-3 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-2xl font-bold"
                  stringRep="Trendanalyse"
                >
                  Trendanalyse
                </PageTitle>
                <Tooltip
                  tooltip={`         
                  Die Trendanalyse visualisiert die Veränderung der
                  Sicherheitskriterien in Anbetracht der Zeit. Zusätzlich stellt sie
                  die Werte der verwalteten Dienste im Vergleich zu den Werten der Top
                  100.000 .de Domains sowie der globalen Top 100.000 Domains dar. Die
                  Daten werden täglich aktualisiert.`}
                >
                  <div className="text-dunkelgrau-100">
                    <FontAwesomeIcon size="xl" icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </div>
            </div>

            {!isGuest && (
              <div className="sticky z-20 border-b-6 border-b-hellgrau-40 beneath-header py-2 bg-white flex flex-row mb-4 items-center">
                <div className="max-w-screen-xl px-3 text-lg gap-1 flex flex-col flex-1 mx-auto">
                  <div className="flex flex-row justify-between">
                    <span className="font-semibold">
                      Domain-Gruppe (Anzahl der Domains)
                    </span>
                    <div className="flex-row hidden md:flex justify-end sticky pointer-events-none zoom-button z-20">
                      <div className="pointer-events-auto overflow-hidden">
                        <ToggleGroup.Root
                          className="ToggleGroup"
                          type="single"
                          onValueChange={(value) => {
                            setZoomLevel(parseInt(value));
                          }}
                          value={zoomLevel.toString()}
                          aria-label="Text alignment"
                        >
                          <ToggleGroup.Item
                            className="ToggleGroupItem"
                            value="2"
                            aria-label="Right aligned"
                          >
                            <div
                              className={classNames(
                                "border hover:bg-dunkelblau-100",
                                zoomLevel === 2
                                  ? "bg-dunkelblau-100"
                                  : "bg-white"
                              )}
                            >
                              <div
                                className={classNames(
                                  "grid grid-cols-1 hover:invert gap-0.5 p-3",
                                  zoomLevel === 2 && "invert"
                                )}
                              >
                                <div className="w-5 h-2 bg-textblack" />
                                <div className="w-5 h-2 bg-textblack" />
                              </div>
                            </div>
                          </ToggleGroup.Item>
                          <ToggleGroup.Item
                            className="ToggleGroupItem"
                            value="1"
                            aria-label="Center aligned"
                          >
                            <div
                              className={classNames(
                                "hover:bg-dunkelblau-100 border transition-all",
                                zoomLevel === 1
                                  ? "bg-dunkelblau-100"
                                  : "bg-white"
                              )}
                            >
                              <div
                                className={classNames(
                                  "grid hover:invert  transition-all grid-cols-2 gap-0.5 p-3",
                                  zoomLevel === 1 && "invert"
                                )}
                              >
                                <div className="w-2 h-2 bg-textblack" />
                                <div className="w-2 h-2 bg-textblack" />
                                <div className="w-2 h-2 bg-textblack" />
                                <div className="w-2 h-2 bg-textblack" />
                              </div>
                            </div>
                          </ToggleGroup.Item>

                          <ToggleGroup.Item
                            className="ToggleGroupItem"
                            value="0"
                            aria-label="Left aligned"
                          >
                            <div
                              className={classNames(
                                " hover:bg-dunkelblau-100 border transition-all",
                                zoomLevel === 0
                                  ? "bg-dunkelblau-100"
                                  : "bg-white"
                              )}
                            >
                              <div
                                className={classNames(
                                  "grid hover:invert grid-cols-3 gap-0.5 p-3",
                                  zoomLevel === 0 && "invert"
                                )}
                              >
                                <div className="w-1 h-2 bg-textblack" />
                                <div className="w-1 h-2 bg-textblack" />
                                <div className="w-1 h-2 bg-textblack" />
                                <div className="w-1 h-2 bg-textblack" />
                                <div className="w-1 h-2 bg-textblack" />
                                <div className="w-1 h-2 bg-textblack" />
                              </div>
                            </div>
                          </ToggleGroup.Item>
                        </ToggleGroup.Root>
                      </div>
                    </div>
                  </div>
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
            )}

            <div className={classNames(noDomains && "relative")}>
              <div
                className={classNames(
                  "max-w-screen-xl gap-4 pb-10 flex flex-row mx-auto px-3 flex-1 text-white",
                  noDomains && "blur-sm pointer-events-none"
                )}
              >
                <div className="flex-1">
                  <LineCharts
                    zoomLevel={zoomLevel}
                    displayCollections={_displayCollections}
                    displayInspections={displayInspections}
                    dataPerInspection={dataPerInspection}
                    defaultCollectionId={props.defaultCollectionId}
                  />
                </div>
              </div>
              {noDomains && (
                <div className="absolute pointer-events-auto top-20  text-base flex left-0 flex-row w-full justify-center right-0 mb-10 px-3 flex-1">
                  <div className="p-5 flex max-w-screen-lg flex-row bg-hellorange-100 text-textblack">
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
  async (
    context,
    [currentUser, session, prisma]
  ): Promise<ServerSideProps<Props>> => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forceCollection = context.query.forceCollection as string | undefined;
    if (forceCollection && isAdmin(session)) {
      currentUser = {
        id: "admin",
        defaultCollectionId: +forceCollection,
        collectionId: +forceCollection,
      } as Guest;
    }

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
  withSessionServerSideProps,
  withDB
);

export default Dashboard;
