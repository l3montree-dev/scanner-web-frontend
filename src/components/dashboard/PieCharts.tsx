import { FunctionComponent } from "react";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryPie,
  VictoryTooltip,
} from "victory";
import { titleMapper } from "../../messages";
import { ChartData, CollectionStatMap } from "../../types";
import { linkMapper } from "../../utils/common";
import { displayInspections, tailwindColors } from "../../utils/view";

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
            className="bg-deepblue-600 border flex-col flex border-deepblue-100"
            key={key}
          >
            <div className="flex-1 pt-5 relative">
              {linkMapper[key] !== "" && (
                <a
                  download
                  target={"_blank"}
                  href={linkMapper[key]}
                  className="text-sm absolute w-full inline-block overflow-hidden truncate text-right whitespace-nowrap top-1 underline right-0 mt-2 px-5"
                  rel="noreferrer"
                >
                  &quot;{titleMapper[key]}&quot; jetzt umsetzen!
                </a>
              )}
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
                      x: `Implementiert (${(
                        currentStat.data[key] * 100
                      ).toFixed(1)}%)`,
                      y: currentStat.totalCount * currentStat.data[key],
                    },
                    {
                      x:
                        currentStat.totalCount === 0
                          ? "Keine Testergebnisse vorhanden"
                          : `Fehlerhaft (${(
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
            <h2
              title={titleMapper[key]}
              className="text-center whitespace-nowrap text-ellipsis overflow-hidden bg-deepblue-400 border-t border-deepblue-50 mt-1 p-3"
            >
              {titleMapper[key]}
            </h2>
          </div>
        );
      })}
    </div>
  );
};

export default PieCharts;
