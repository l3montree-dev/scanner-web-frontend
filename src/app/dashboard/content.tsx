"use client";

import {
  faCircleInfo,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FunctionComponent, useEffect, useMemo, useState } from "react";
import EmptyDashboardNotice from "../../components/EmptyDashboardNotice";
import PageTitle from "../../components/PageTitle";
import Tooltip from "../../components/common/Tooltip";
import PieCharts from "../../components/dashboard/PieCharts";
import useRefreshOnVisit from "../../hooks/useRefreshOnVisit";
import { ChartData, IDashboard } from "../../types";
import { classNames } from "../../utils/common";
import { diffDays } from "../../utils/view";

interface Props {
  dashboard: IDashboard;
  defaultCollectionId: number;
  refCollections: number[];
}
const Content: FunctionComponent<Props> = (props) => {
  useRefreshOnVisit("dashboard");

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

  const [displayCollections, setDisplayCollections] = useState(
    props.refCollections.concat(props.defaultCollectionId)
  );

  const [data, setData] = useState({
    totalCount: currentStat.totalCount,
    data: Object.fromEntries(
      Object.keys(currentStat.data).map((key) => [key, 0])
    ),
  });

  const noDomains = dashboard.totals.uniqueTargets === 0;

  const expectedSeriesLength = useMemo(
    () => diffDays(new Date(2023, 0, 15), new Date()),
    []
  );

  useEffect(() => {
    setData(currentStat);
  }, [currentStat]);
  return (
    <>
      <div className="mb-0 gap-2 flex flex-row items-center">
        <PageTitle className="text-2xl  font-bold" stringRep="Dashboard">
          Dashboard
        </PageTitle>
        <Tooltip
          tooltip={`         
      Das Dashboard bietet eine Übersicht über den Sicherheitszustand von Domain-Gruppen.`}
        >
          <div className="text-dunkelgrau-100">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </div>
        </Tooltip>
      </div>
      <div className={classNames(noDomains && "relative pointer-events-none")}>
        <div
          className={classNames(
            "max-w-screen-2xl pb-10 mx-auto flex-1 ",
            noDomains && "blur-sm overflow-hidden"
          )}
          style={{
            maxHeight: noDomains ? "calc(100vh)" : "auto",
          }}
        >
          <PieCharts
            isGeneratingStats={
              expectedSeriesLength >
              (dashboard.historicalData[props.defaultCollectionId]?.series
                .length ?? 0)
            }
            displayCollections={displayCollections}
            historicalData={dashboard.historicalData}
            defaultCollectionId={props.defaultCollectionId}
            currentStat={data as ChartData}
          />
        </div>
        {noDomains && (
          <div className="absolute pointer-events-auto z-90 mt-10 top-0 flex flex-row justify-center left-0 right-0 mb-10 px-3 flex-1">
            <div className="p-5 flex flex-row bg-hellgrau-60 max-w-screen-lg text-textblack">
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
