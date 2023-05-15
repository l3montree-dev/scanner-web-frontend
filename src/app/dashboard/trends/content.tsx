"use client";

import {
  faCircleInfo,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import EmptyDashboardNotice from "../../../components/EmptyDashboardNotice";
import PageTitle from "../../../components/PageTitle";
import Tooltip from "../../../components/common/Tooltip";
import LineCharts from "../../../components/dashboard/LineCharts";
import useWindowSize from "../../../hooks/useWindowSize";
import { ChartData, IDashboard } from "../../../types";
import { classNames, dateFormat } from "../../../utils/common";
import {
  displayInspections,
  localizeDefaultCollection,
} from "../../../utils/view";

interface Props {
  defaultCollectionId: number;
  refCollections: number[];
  dashboard: IDashboard;
  username?: string;
}

const Content: FunctionComponent<Props> = (props) => {
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
                    props.username || "Meine"
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
    [dashboard.historicalData, props.username, props.defaultCollectionId]
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

  return (
    <>
      <div className=" mb-0 gap-2 flex flex-row items-center">
        <PageTitle className="text-2xl font-bold" stringRep="Trendanalyse">
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
            <FontAwesomeIcon icon={faQuestionCircle} />
          </div>
        </Tooltip>
      </div>
      {/*!isGuest && (
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
                  )*/}

      <div className={classNames(noDomains && "relative")}>
        <div
          className={classNames(
            "max-w-screen-2xl gap-4 pb-10 mt-5 flex flex-row mx-auto  flex-1 text-white",
            noDomains && "blur-sm pointer-events-none overflow-hidden"
          )}
          style={{
            maxHeight: noDomains ? "calc(100vh)" : "auto",
          }}
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
            <div className="p-5 flex max-w-screen-lg flex-row bg-hellgrau-60 text-textblack">
              <div className="pr-3 pt-1">
                <FontAwesomeIcon size={"lg"} icon={faCircleInfo} />
              </div>
              <EmptyDashboardNotice />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Content;
