import {
  faDownload,
  faExternalLinkAlt,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";

import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryAxis,
  VictoryLine,
  VictoryArea,
} from "victory";
import { InspectionType } from "../../inspection/scans";
import { descriptionMapper, titleMapper } from "../../messages";
import { theme } from "../../styles/victory-theme";
import { linkMapper } from "../../utils/common";
import { tailwindColors } from "../../utils/view";
import { RefLabelComponent } from "./RefLabelComponent";
import { Canvg } from "canvg";
import Tooltip from "../Tooltip";
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
  const chartRef = React.useRef<any>(null);
  const exportToPng = async () => {
    if (chartRef.current) {
      const svg = (
        chartRef.current.containerRef as HTMLDivElement
      ).querySelector("svg");

      if (svg) {
        const clonedNode = svg.cloneNode(true) as SVGSVGElement;

        // add a full size white rect as background color.
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");
        clonedNode.insertBefore(rect, clonedNode.firstChild);

        // remove all elements with fill: url(#...)
        const paths = clonedNode.querySelectorAll("path");
        paths.forEach((path) => {
          // remove any shade
          if (
            path.getAttribute("fill")?.startsWith("url") ||
            path.style.fill.startsWith("url")
          ) {
            path.remove();
          } else if (path.style.stroke === "rgb(172, 252, 207)") {
            // primary line
            path.style.stroke = tailwindColors.lightning["900"];
          }
        });

        const lines = clonedNode.querySelectorAll("line");
        lines.forEach((line) => {
          if (line.style.stroke === "rgb(56, 63, 106)") {
            line.style.stroke = "rgb(0, 0, 0)";
          } else if (line.style.stroke === "rgb(203, 213, 225)") {
            // ticks
            line.style.stroke = "rgb(20,20,20)";
          } else if (line.style.stroke === "rgba(255, 255, 255, 0.1)") {
            // grid lines
            line.style.stroke = "rgb(200,200,200)";
          }
        });

        const rects = clonedNode.querySelectorAll("rect");
        rects.forEach((rect) => {
          if (rect.style.fill === "rgb(0, 3, 46)") {
            rect.style.fill = "rgb(255,255,255)";
          }
        });

        // change the font color
        const texts = clonedNode.querySelectorAll("tspan");
        texts.forEach((text) => {
          if (text.style.fill === "rgb(203, 213, 225)") {
            // tick labels
            text.style.fill = "rgb(20, 20, 20)";
          } else if (text.style.fill === "rgb(172, 252, 207)") {
            // axis labels
            text.style.fill = tailwindColors.lightning["900"];
          }
        });

        const canvas = document.createElement("canvas");
        const svgSize = svg.getBoundingClientRect();

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        canvas.width = svgSize.width * 4;
        canvas.height = svgSize.height * 4;
        // add a white background color.
        const serializer = new XMLSerializer();
        const c = Canvg.fromString(
          ctx,
          serializer.serializeToString(clonedNode)
        );
        await c.render();

        // download the image
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${titleMapper[inspectionType]}.png`;
        a.click();
      }
    }
  };
  return (
    <div className="group/chart pb-4 bg-deepblue-400 rounded-md shadow-xl historical-chart flex-col flex">
      <div className="flex-1 pt-5 relative">
        <button
          onClick={exportToPng}
          className="group-hover/chart:opacity-100 cursor-pointer z-10 opacity-0 rounded-full bg-deepblue-100/50 h-6 absolute top-3 right-3 w-6 text-sm transition-all"
        >
          <FontAwesomeIcon className="opacity-100" icon={faDownload} />
        </button>

        <VictoryChart
          containerComponent={<VictoryZoomContainer ref={chartRef} />}
          theme={theme}
          height={360}
          width={zoomLevelToWidth(zoomLevel)}
          padding={{ top: 20, bottom: 40, left: 55, right: 10 }}
          minDomain={{ y: Math.max(-1, data.min - data.max / 20) }}
          maxDomain={{ y: Math.min(101.5, data.max + data.max / 20) }}
          domainPadding={{ x: [0, 30], y: [100, 100] }}
        >
          <defs>
            <linearGradient x2="0%" y2="100%" id="serviceGradient">
              <stop offset="0%" stopColor={"rgba(172,252,207,0.2)"} />

              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          <VictoryAxis fixLabelOverlap />
          <VictoryAxis
            tickFormat={(t) => `${t}%`}
            dependentAxis
            domain={{ y: [-10, 1000] }}
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
        className="text-left text-white px-6 text-lg text-ellipsis font-bold bg-deepblue-400 border-deepblue-50 mt-1"
      >
        {titleMapper[inspectionType]}{" "}
        <Tooltip
          tooltip={
            <>
              <p className="mb-4">{descriptionMapper[inspectionType]}</p>
              {linkMapper[inspectionType] !== "" && (
                <a
                  download
                  target={"_blank"}
                  href={linkMapper[inspectionType]}
                  className="text-lightning-500"
                  rel="noreferrer"
                >
                  &quot;{titleMapper[inspectionType]}&quot; One-Pager
                  herunterladen
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
  );
};

export default LineChart;
