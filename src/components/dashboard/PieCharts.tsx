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
import {
  displayInspections,
  localizeDefaultCollection,
  tailwindColors,
} from "../../utils/view";
import CollectionDataPill from "../CollectionDataPill";
import Tooltip from "../Tooltip";
import tinycolor from "tinycolor2";

interface Props {
  displayCollections: number[];
  defaultCollectionId: number;
  currentStat: ChartData;
  historicalData: CollectionStatMap;
  username: string;
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
  id: number;
  title: string;
  color: string;
  percentage: number;
};
const PieCharts: FunctionComponent<Props> = ({
  displayCollections,
  currentStat,
  defaultCollectionId,
  historicalData,
  username,
}) => {
  const router = useRouter();
  return (
    <div className="mt-5 justify-start gap-8 flex-wrap grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 grid 2xl:grid-cols-3">
      {displayInspections.map((key) => {
        const percentage = currentStat.data[key] * 100;
        let padAngle = 3;
        // If the percentage is too small, don't show the padAngle
        if (100 - percentage < 1.5 || percentage < 1.5) {
          padAngle = 0;
        }

        const refData = displayCollections
          .map((collection) => {
            const ref = historicalData[collection];
            if (!ref) return null;
            const loc = localizeDefaultCollection(
              { ...ref, id: collection },
              defaultCollectionId,
              username
            );

            return {
              title: loc.title,
              color: loc.color,
              id: collection,
              percentage: ref.series[ref.series.length - 1].data[key] * 100,
            };
          })
          .filter((r): r is RefData => r !== null);

        return (
          <div className="bg-hellgrau-20 pb-5 flex-col flex" key={key}>
            <div className="flex-1 z-0">
              <VictoryChart prependDefaultAxes={false} width={300} height={300}>
                <VictoryAxis
                  style={{
                    axis: { stroke: "transparent" },
                    ticks: { stroke: "transparent" },
                    tickLabels: { fill: "transparent" },
                  }}
                />
                {refData.map((r, i) => (
                  <VictoryPie
                    key={r.id}
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
                                          ? tinycolor(r.color)
                                              .setAlpha(0.8)
                                              .toString()
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
                                    }&collectionIds=${r.id}`
                                  );
                                },
                              },
                            ];
                          },
                        },
                      },
                    ]}
                    innerRadius={57 + i * 15}
                    radius={70 + i * 15}
                    labelComponent={
                      <VictoryTooltip
                        renderInPortal
                        constrainToVisibleArea
                        cornerRadius={0}
                        style={{
                          fill: "textblack",
                          fontSize: 16,
                        }}
                        flyoutStyle={{
                          stroke: "none",
                          fill: tailwindColors.hellgrau["100"],
                        }}
                        dx={0}
                        pointerLength={0}
                      />
                    }
                    colorScale={[r.color, tailwindColors.blau["20"]]}
                    data={[
                      {
                        key: "implemented",
                        x: `${r.title} ${r.percentage.toFixed(1)}%`,
                        y: r.percentage,
                      },
                      {
                        key: "notImplemented",
                        x:
                          currentStat.totalCount === 0
                            ? "Keine Testergebnisse vorhanden"
                            : `${r.title} nicht erfüllt ${r.percentage.toFixed(
                                1
                              )}%`,
                        y: 100 - r.percentage,
                      },
                    ]}
                  />
                ))}
              </VictoryChart>
            </div>
            <div className="flex flex-1 items-center px-6 flex-row">
              <h2
                title={titleMapper[key]}
                className="text-left break-normal text-lg font-bold mt-1"
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
                          className=""
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
                  <div className="inline ml-2">
                    <FontAwesomeIcon fontSize={18} icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </h2>
            </div>
            <div className="flex-1">
              <p className="px-6">
                <span className="text-textblack">Gesamt</span>
                <br />
                <Link href={`/dashboard/targets?${key}=1`}>
                  <span className="">
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
                  <span className="text-yellow-500">
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
                  <CollectionDataPill key={title} color={color} title={title}>
                    <div className="text-sm">{title}</div>
                    <span className="ml-2 text-sm">
                      {percentage.toFixed(1)}%
                    </span>
                  </CollectionDataPill>
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
