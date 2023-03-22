import Link from "next/link";
import React, { FunctionComponent } from "react";

import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryAxis,
  VictoryLine,
  VictoryArea,
} from "victory";
import { InspectionType } from "../../inspection/scans";
import { titleMapper } from "../../messages";
import { theme } from "../../styles/victory-theme";
import { linkMapper } from "../../utils/common";
import { tailwindColors } from "../../utils/view";
import { RefLabelComponent } from "./RefLabelComponent";

interface Props {
  displayCollections: number[];
  inspectionType: InspectionType;
  data: {
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
  defaultCollectionId: number;
  zoomLevel: number;
}
const zoomLevelToWidth = (zoomLevel: number) => {
  switch (zoomLevel) {
    case 0:
      return 358;
    case 1:
      return 540;
    case 2:
      return 1090;
    default:
      return 360;
  }
};

const LineChart: FunctionComponent<Props> = ({
  inspectionType,
  data,
  displayCollections,
  defaultCollectionId,
  zoomLevel,
}) => {
  return (
    <div className="bg-deepblue-600 historical-chart border flex-col flex border-deepblue-100">
      <div className="flex-1 pt-5 relative">
        {linkMapper[inspectionType] !== "" && (
          <Link
            target={"_blank"}
            href={linkMapper[inspectionType]}
            className="text-sm absolute w-full inline-block overflow-hidden truncate text-right whitespace-nowrap top-1 underline right-0 mt-2 px-5"
          >
            &quot;{titleMapper[inspectionType]}&quot; jetzt umsetzen!
          </Link>
        )}
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient x2="0%" y2="100%" id="serviceGradient">
              <stop offset="0%" stopColor={"rgba(172,252,207,0.2)"} />

              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
        </svg>
        <VictoryChart
          containerComponent={<VictoryZoomContainer />}
          theme={theme}
          height={360}
          width={zoomLevelToWidth(zoomLevel)}
          padding={{ top: 20, bottom: 40, left: 55, right: 10 }}
          minDomain={{ y: Math.max(0, data.min - data.max / 20) }}
          maxDomain={{ y: Math.min(100, data.max + data.max / 20) }}
          domainPadding={{ x: [0, 30], y: [10, 10] }}
        >
          <VictoryAxis fixLabelOverlap />
          <VictoryAxis
            tickFormat={(t) => `${t}%`}
            dependentAxis
            fixLabelOverlap
          />
          {displayCollections.map((collectionId, i, arr) => {
            const d = data.data[collectionId];
            if (!d) return null;
            const color =
              +collectionId === defaultCollectionId
                ? tailwindColors.lightning["500"]
                : d.color;

            return (
              <VictoryLine
                key={collectionId}
                style={{
                  data: {
                    strokeLinecap: "round",
                    stroke: color,
                  },
                }}
                interpolation={"basis"}
                labels={(label) => {
                  if (+label.index === d.series.length - 1) {
                    return `${label.datum.y.toFixed(1)}%`;
                  }
                  return d.title;
                }}
                labelComponent={
                  <RefLabelComponent
                    fill={color}
                    nRefComponents={arr.length}
                    i={i}
                  />
                }
                data={d.series}
              />
            );
          })}
          {displayCollections.includes(defaultCollectionId) &&
            defaultCollectionId in data.data && (
              <VictoryArea
                style={{
                  data: {
                    fill: "url(#serviceGradient)",
                  },
                }}
                data={data.data[defaultCollectionId]!.series}
              />
            )}
        </VictoryChart>
      </div>
      <h2
        title={titleMapper[inspectionType]}
        className="text-center whitespace-nowrap text-ellipsis overflow-hidden border-t border-deepblue-50 bg-deepblue-400 mt-1 p-3"
      >
        {titleMapper[inspectionType]}
      </h2>
    </div>
  );
};

export default LineChart;
