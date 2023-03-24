import {
  faExternalLinkAlt,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryPie,
  VictoryTooltip,
} from "victory";
import { descriptionMapper, titleMapper } from "../../messages";
import { ChartData, CollectionStatMap } from "../../types";
import { linkMapper } from "../../utils/common";
import { displayInspections, tailwindColors } from "../../utils/view";
import Tooltip from "../Tooltip";

interface Props {
  displayCollections: number[];
  defaultCollectionId: number;
  currentStat: ChartData;
  historicalData: CollectionStatMap;
}

const percentageToXInPieChart = (percentage: number, r = 100) => {
  return (
    -1 *
      Math.cos(
        (+percentage / 100) * 360 * (Math.PI / 180) + 90 * (Math.PI / 180)
      ) *
      r +
    150
  );
};

const percentageToYInPieChart = (percentage: number, r = 100) => {
  return (
    -1 *
      Math.sin(
        (+percentage / 100) * 360 * (Math.PI / 180) + 90 * (Math.PI / 180)
      ) *
      r +
    150
  );
};

type RefData = {
  title: string;
  color: string;
  percentage: number;
};
const PieCharts: FunctionComponent<Props> = ({
  displayCollections,
  currentStat,
  defaultCollectionId,
  historicalData,
}) => {
  const router = useRouter();
  return (
    <div className="mt-5 justify-start gap-2 flex-wrap grid grid-cols-4">
      {displayInspections.map((key) => {
        const percentage = currentStat.data[key] * 100;
        let padAngle = 3;
        // If the percentage is too small, don't show the padAngle
        if (100 - percentage < 1.5 || percentage < 1.5) {
          padAngle = 0;
        }

        const refData = displayCollections
          .filter((c) => c !== defaultCollectionId)
          .map((collection) => {
            const ref = historicalData[collection];
            if (!ref) return null;

            return {
              title: ref.title,
              color: ref.color,
              percentage: ref.series[ref.series.length - 1].data[key] * 100,
            };
          })
          .filter((r): r is RefData => r !== null);
        return (
          <div
            className="bg-deepblue-400 pb-5 rounded-md flex-col flex"
            key={key}
          >
            <div className="flex-1 relative">
              <VictoryChart prependDefaultAxes={false} width={300} height={300}>
                <VictoryAxis
                  style={{
                    axis: { stroke: "transparent" },
                    ticks: { stroke: "transparent" },
                    tickLabels: { fill: "transparent" },
                  }}
                />
                <VictoryPie
                  standalone={false}
                  width={300}
                  height={300}
                  padAngle={padAngle}
                  eventKey="key"
                  events={[
                    {
                      target: "data",
                      eventHandlers: {
                        onMouseLeave: (ev) => {
                          if ("style" in ev.target)
                            (ev.target.style as any).cursor = "";
                          return [
                            {
                              target: "labels",
                              mutation: () => ({ active: false }),
                            },
                            {
                              mutation: () => null,
                            },
                          ];
                        },
                        onMouseOver: (ev) => {
                          if ("style" in ev.target)
                            (ev.target.style as any).cursor = "pointer";
                          return [
                            {
                              target: "labels",
                              mutation: () => ({ active: true }),
                            },
                            {
                              mutation: (props) => {
                                return {
                                  style: Object.assign({}, props.style, {
                                    fill:
                                      props.datum.eventKey === "implemented"
                                        ? tailwindColors.lightning["200"]
                                        : tailwindColors.slate["500"],
                                  }),
                                };
                              },
                            },
                          ];
                        },
                        onClick: () => {
                          return [
                            {
                              mutation: (props) => {
                                router.push(
                                  `/dashboard/targets?${key}=${
                                    props.datum.eventKey === "implemented"
                                      ? "1"
                                      : "-1"
                                  } `
                                );
                              },
                            },
                          ];
                        },
                      },
                    },
                  ]}
                  innerRadius={90}
                  labelComponent={
                    <VictoryTooltip
                      renderInPortal
                      constrainToVisibleArea
                      cornerRadius={0}
                      style={{
                        fill: "white",
                        fontSize: 14,
                      }}
                      flyoutStyle={{
                        stroke: "none",
                        fill: tailwindColors.deepblue["500"],
                      }}
                      dx={0}
                      pointerLength={0}
                    />
                  }
                  colorScale={[
                    tailwindColors.lightning["500"],
                    tailwindColors.slate["600"],
                  ]}
                  data={[
                    {
                      key: "implemented",
                      x: `Erfüllt (${(currentStat.data[key] * 100).toFixed(
                        1
                      )}%)`,
                      y: currentStat.totalCount * currentStat.data[key],
                    },
                    {
                      key: "notImplemented",
                      x:
                        currentStat.totalCount === 0
                          ? "Keine Testergebnisse vorhanden"
                          : `Nicht erfüllt (${(
                              (1 - currentStat.data[key] || 1) * 100
                            ).toFixed(1)}%)`,
                      y:
                        currentStat.totalCount === 0
                          ? 100
                          : currentStat.totalCount *
                            (1 - currentStat.data[key]),
                    },
                  ]}
                />
                <VictoryLabel
                  textAnchor="middle"
                  style={{ fontSize: 30, fill: "white" }}
                  x={150}
                  y={150}
                  text={`${(currentStat.data[key] * 100).toFixed(1)}%`}
                />
                {refData.map(({ title, percentage, color }, i) => {
                  return (
                    <g key={title}>
                      <line
                        x1={percentageToXInPieChart(+percentage, 110)}
                        y1={percentageToYInPieChart(+percentage, 110)}
                        x2={percentageToXInPieChart(+percentage, 80)}
                        y2={percentageToYInPieChart(+percentage, 80)}
                        width={10}
                        style={{
                          stroke: color,
                          strokeWidth: 2,
                        }}
                      />

                      <VictoryLabel
                        textAnchor="middle"
                        x={percentageToXInPieChart(
                          +percentage,
                          i % 2 == 0 ? 70 : 130
                        )}
                        y={percentageToYInPieChart(
                          +percentage,
                          i % 2 == 0 ? 70 : 130
                        )}
                        style={{
                          fontSize: 16,
                          fill: color,
                        }}
                        text={title}
                      />
                    </g>
                  );
                })}
              </VictoryChart>
            </div>
            <div className="flex flex-1 items-center px-6 flex-row">
              <h2
                title={titleMapper[key]}
                className="text-left text-white text-lg text-ellipsis font-bold bg-deepblue-400 border-deepblue-50 mt-1"
              >
                {titleMapper[key]}{" "}
                <Tooltip
                  tooltip={
                    <>
                      <p className="mb-4">{descriptionMapper[key]}</p>
                      {linkMapper[key] !== "" && (
                        <a
                          download
                          target={"_blank"}
                          href={linkMapper[key]}
                          className="text-lightning-500"
                          rel="noreferrer"
                        >
                          &quot;{titleMapper[key]}&quot; One-Pager herunterladen
                          <FontAwesomeIcon
                            fontSize={15}
                            className="ml-2"
                            icon={faExternalLinkAlt}
                          />
                        </a>
                      )}
                    </>
                  }
                >
                  <div className="text-slate-400 inline ml-2">
                    <FontAwesomeIcon fontSize={18} icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </h2>
            </div>
            <div className="flex-1">
              <p className="text-sm px-6">
                <Link href={`/dashboard/targets?${key}=1`}>
                  <span className="text-lightning-500">
                    Erfüllt von{" "}
                    {(currentStat.data[key] * currentStat.totalCount).toFixed(
                      0
                    )}{" "}
                    Domain
                    {currentStat.data[key] * currentStat.totalCount !== 1
                      ? "s"
                      : ""}
                    <FontAwesomeIcon
                      fontSize={15}
                      className="ml-2"
                      icon={faExternalLinkAlt}
                    />
                  </span>
                </Link>
                <br />
                <Link href={`/dashboard/targets?${key}=-1`}>
                  <span className="opacity-75">
                    Nicht erfüllt von{" "}
                    {(
                      (1 - currentStat.data[key]) *
                      currentStat.totalCount
                    ).toFixed(0)}{" "}
                    Domain
                    {(1 - currentStat.data[key]) * currentStat.totalCount !== 1
                      ? "s"
                      : ""}
                    <FontAwesomeIcon
                      fontSize={15}
                      className="ml-2"
                      icon={faExternalLinkAlt}
                    />
                  </span>
                </Link>
              </p>
            </div>
            <div className="flex flex-row items-center flex-wrap mt-2 gap-2 px-6">
              {refData.map(({ title, percentage, color }, i) => {
                return (
                  <div
                    key={title}
                    style={{
                      backgroundColor: color,
                    }}
                    className="flex items-center text-deepblue-500  rounded-full px-2 py-1"
                  >
                    <div className="text-sm">{title}</div>
                    <span className="ml-2 text-sm">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PieCharts;
