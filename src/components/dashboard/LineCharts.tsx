import * as ToggleGroup from "@radix-ui/react-toggle-group";
import React, { FunctionComponent } from "react";

import { InspectionType } from "../../inspection/scans";
import { classNames } from "../../utils/common";
import LineChart from "./LineChart";

interface Props {
  displayCollections: number[];
  displayInspections: InspectionType[];
  dataPerInspection: {
    [key: string]: {
      data: {
        [collectionId: number]:
          | {
              series: { x: string; y: number }[];
              title: string;
              color: string;
            }
          | undefined;
      };
      min: number;
      max: number;
    };
  };
  defaultCollectionId: number;
}

const LineCharts: FunctionComponent<Props> = ({
  displayCollections,
  displayInspections,
  dataPerInspection,
  defaultCollectionId,
}) => {
  const [zoomLevel, setZoomLevel] = React.useState(0);
  return (
    <>
      <h2 className="text-2xl mt-10 mb-5">Trendanalyse</h2>
      <div className="justify-between flex flex-row items-start">
        <p className="mb-10 flex-1 text-slate-300">
          Die Trendanalyse visualisiert die Veränderung der Sicherheitskriterien
          in Anbetracht der Zeit. Zusätzlich stellt sie die Werte der
          verwalteten Dienste im Vergleich zu den Werten der Top 100.000 .de
          Domains sowie der globalen Top 100.000 Domains dar. Die Daten werden
          täglich aktualisiert.
        </p>
      </div>
      <div className="flex flex-row justify-end sticky pointer-events-none zoom-button z-20">
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
              value="0"
              aria-label="Left aligned"
            >
              <div
                className={classNames(
                  "grid grid-cols-3 gap-0.5 p-3 hover:bg-deepblue-50 border-t border-t-deepblue-50",
                  zoomLevel === 0 ? "bg-deepblue-50" : "bg-deepblue-100"
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
            <ToggleGroup.Item
              className="ToggleGroupItem"
              value="1"
              aria-label="Center aligned"
            >
              <div
                className={classNames(
                  "grid hover:bg-deepblue-50 grid-cols-2 gap-0.5 p-3 border-t border-t-deepblue-50",
                  zoomLevel === 1 ? "bg-deepblue-50" : "bg-deepblue-100"
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
              value="2"
              aria-label="Right aligned"
            >
              <div
                className={classNames(
                  "grid grid-cols-1 gap-0.5 p-3 hover:bg-deepblue-50 border-t border-t-deepblue-50",
                  zoomLevel === 2 ? "bg-deepblue-50" : "bg-deepblue-100"
                )}
              >
                <div className="w-3 h-1 bg-white" />
                <div className="w-3 h-1 bg-white" />
              </div>
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </div>
      </div>
      <div
        style={{
          gridTemplateColumns: `repeat(${3 - zoomLevel}, 1fr)`,
        }}
        className={classNames("mt-5 grid gap-2 justify-start")}
      >
        {displayInspections.map((key) => {
          return (
            <LineChart
              key={key}
              zoomLevel={zoomLevel}
              inspectionType={key}
              displayCollections={displayCollections}
              defaultCollectionId={defaultCollectionId}
              data={dataPerInspection[key]}
            />
          );
        })}
      </div>
    </>
  );
};

export default LineCharts;
