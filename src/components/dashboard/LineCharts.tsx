import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      <div className="flex flex-row justify-end sticky zoom-button">
        <button
          onClick={() => {
            setZoomLevel(Math.max(0, zoomLevel - 1));
          }}
          className={classNames(
            "bg-deepblue-100 mr-1 p-2 hover:bg-deepblue-50 transition-all",
            zoomLevel === 0 && "opacity-50 cursor-not-allowed"
          )}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
        </button>

        <button
          onClick={() => {
            setZoomLevel(Math.min(2, zoomLevel + 1));
          }}
          className={classNames(
            "bg-deepblue-100 p-2 hover:bg-deepblue-50 transition-all",
            zoomLevel === 2 && "opacity-50 cursor-not-allowed"
          )}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </button>
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
