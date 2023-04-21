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
import LineCharts from "../../components/dashboard/LineCharts";
import PieCharts from "../../components/dashboard/PieCharts";
import { config } from "../../config";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserOrGuestServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import { useIsGuest } from "../../hooks/useIsGuest";
import { useSession } from "../../hooks/useSession";
import { collectionService } from "../../services/collectionService";
import { reportService } from "../../services/reportService";
import { statService } from "../../services/statService";
import { ChartData, Diffs, IDashboard } from "../../types";
import {
  Normalized,
  classNames,
  collectionId,
  dateFormat,
  normalizeToMap,
  replaceNullWithZero,
} from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import { displayInspections, tailwindColors } from "../../utils/view";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import useWindowSize from "../../hooks/useWindowSize";
import React from "react";

interface Props {
  diffs: Diffs;
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
          <main className="bg-deepblue-600 flex-col flex flex-1">
            <div className="max-w-screen-xl w-full mb-5 pt-10 mx-auto">
              <div className="text-white mb-0 px-3 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-4xl text-white font-bold"
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
                  <div className="text-slate-400">
                    <FontAwesomeIcon size="xl" icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </div>
            </div>

            {!isGuest && (
              <div className="text-white sticky z-20 shadow-lg beneath-header py-2 bg-deepblue-300 flex flex-row mb-4 items-center">
                <div className="max-w-screen-xl px-3 text-lg gap-1 flex flex-col flex-1 mx-auto">
                  <div className="flex flex-row justify-between">
                    <span className="font-semibold">
                      Domain-Gruppe (Anzahl der Domains)
                    </span>
                    <div className="flex-row hidden md:flex justify-end sticky pointer-events-none zoom-button z-20">
                      <div className="pointer-events-auto overflow-hidden rounded-sm">
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
                                "grid grid-cols-1 gap-0.5 p-3 hover:bg-deepblue-50",
                                zoomLevel === 2
                                  ? "bg-deepblue-50"
                                  : "bg-deepblue-100"
                              )}
                            >
                              <div className="w-3 h-1 bg-white" />
                              <div className="w-3 h-1 bg-white" />
                            </div>
                          </ToggleGroup.Item>
                          <ToggleGroup.Item
                            className="ToggleGroupItem"
                            value="1"
                            aria-label="Center aligned"
                          >
                            <div
                              className={classNames(
                                "grid hover:bg-deepblue-50 grid-cols-2 gap-0.5 p-3",
                                zoomLevel === 1
                                  ? "bg-deepblue-50"
                                  : "bg-deepblue-100"
                              )}
                            >
                              <div className="w-1 h-1 bg-white" />
                              <div className="w-1 h-1 bg-white" />
                              <div className="w-1 h-1 bg-white" />
                              <div className="w-1 h-1 bg-white" />
                            </div>
                          </ToggleGroup.Item>

                          <ToggleGroup.Item
                            className="ToggleGroupItem"
                            value="0"
                            aria-label="Left aligned"
                          >
                            <div
                              className={classNames(
                                "grid grid-cols-3 gap-0.5 p-3 hover:bg-deepblue-50",
                                zoomLevel === 0
                                  ? "bg-deepblue-50"
                                  : "bg-deepblue-100"
                              )}
                            >
                              <div className="w-0.5 h-1 bg-white" />
                              <div className="w-0.5 h-1 bg-white" />
                              <div className="w-0.5 h-1 bg-white" />
                              <div className="w-0.5 h-1 bg-white" />
                              <div className="w-0.5 h-1 bg-white" />
                              <div className="w-0.5 h-1 bg-white" />
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

            <div
              className={classNames(
                noDomains && "relative pointer-events-none"
              )}
            >
              <div
                className={classNames(
                  "max-w-screen-xl pb-10 mx-auto px-3 flex-1 text-white",
                  noDomains && "blur-sm"
                )}
              >
                <LineCharts
                  diffs={props.diffs}
                  zoomLevel={zoomLevel}
                  displayCollections={_displayCollections}
                  displayInspections={displayInspections}
                  dataPerInspection={dataPerInspection}
                  defaultCollectionId={props.defaultCollectionId}
                />
              </div>
              {noDomains && (
                <div className="absolute mt-10 top-0 lg:left-1/2 right-0 lg:-translate-x-1/2 mb-10 px-3 flex-1">
                  <div className="border-blue-500/20 p-5 flex flex-row rounded-md bg-slate-300 text-deepblue-500">
                    <div className="pr-3">
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

    const [dashboard, referenceChartData, collections, diffs] =
      await Promise.all([
        statService.getDashboardForUser(currentUser, prisma),
        statService.getReferenceChartData(prisma),
        collectionService.getAllCollectionsOfUser(currentUser, prisma, true),
        await reportService.getChangedInspectionsOfUser(
          currentUser,
          { start: yesterday, end: new Date(), page: 0, pageSize: 20 },
          prisma
        ),
      ]);

    return {
      props: {
        diffs: diffs,
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
