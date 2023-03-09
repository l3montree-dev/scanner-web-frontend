import Link from "next/link";
import React, { FunctionComponent } from "react";

import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryLine,
  VictoryArea,
} from "victory";
import { InspectionType } from "../../inspection/scans";
import { titleMapper } from "../../messages";
import { theme } from "../../styles/victory-theme";
import { linkMapper } from "../../utils/common";
import { tailwindColors } from "../../utils/view";
import { LabelComponent } from "./LabelComponent";
import { RefLabelComponent } from "./RefLabelComponent";

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
  return (
    <div className="mt-5 grid grid-cols-3 gap-2 justify-start">
      {displayInspections.map((key) => {
        const { data, min, max } = dataPerInspection[key];
        return (
          <div className="w-full" key={key}>
            <div className="bg-deepblue-600 historical-chart border flex-col flex border-deepblue-100">
              <div className="flex-1 pt-5 relative">
                {linkMapper[key] !== "" && (
                  <Link
                    target={"_blank"}
                    href={linkMapper[key]}
                    className="text-sm absolute w-full inline-block overflow-hidden truncate text-right whitespace-nowrap top-1 underline right-0 mt-2 px-5"
                  >
                    &quot;{titleMapper[key]}&quot; jetzt umsetzen!
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
                  containerComponent={
                    <VictoryVoronoiContainer width={330} voronoiDimension="x" />
                  }
                  theme={theme}
                  minDomain={{ y: Math.max(0, min - max / 20) }}
                  maxDomain={{ y: Math.min(100, max + max / 20) }}
                  domainPadding={{ x: [0, 5], y: [10, 10] }}
                >
                  <VictoryAxis fixLabelOverlap />
                  <VictoryAxis
                    tickFormat={(t) => `${t}%`}
                    dependentAxis
                    fixLabelOverlap
                  />
                  {displayCollections.map((collectionId, i, arr) => {
                    const d = data[collectionId];
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
                    defaultCollectionId in data && (
                      <VictoryArea
                        style={{
                          data: {
                            fill: "url(#serviceGradient)",
                          },
                        }}
                        data={data[defaultCollectionId]!.series}
                      />
                    )}
                </VictoryChart>
              </div>
              <h2
                title={titleMapper[key]}
                className="text-center whitespace-nowrap text-ellipsis overflow-hidden border-t border-deepblue-50 bg-deepblue-400 mt-1 p-3"
              >
                {titleMapper[key]}
              </h2>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LineCharts;
