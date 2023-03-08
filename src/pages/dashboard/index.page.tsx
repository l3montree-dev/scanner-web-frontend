import {
  faCaretDown,
  faChevronDown,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection } from "@prisma/client";
import Link from "next/link.js";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryPie,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import tailwindConfig from "../../../tailwind.config";
import CollectionMenu from "../../components/CollectionMenu";
import CollectionPill from "../../components/CollectionPill";
import DashboardPage from "../../components/DashboardPage";
import SideNavigation from "../../components/SideNavigation";
import { config } from "../../config";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import {
  CertificateInspectionType,
  ContentInspectionType,
  CookieInspectionType,
  DomainInspectionType,
  HeaderInspectionType,
  HttpInspectionType,
  InspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../../inspection/scans";
import { collectionService } from "../../services/collectionService";
import { statService } from "../../services/statService";
import { theme } from "../../styles/victory-theme";
import { ChartData, IDashboard } from "../../types";
import {
  dateFormat,
  linkMapper,
  Normalized,
  normalizeToMap,
  replaceNullWithZero,
} from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";

interface Props {
  dashboard: IDashboard;
  keycloakIssuer: string;
  defaultCollectionId: number;
  collections: Normalized<DTO<Collection>>;
  refCollections: number[]; // the collections which were defined using environment variables
}

const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = (fullConfig.theme as any).colors;

const mapping: { [key in InspectionType]: string } = {
  [HttpInspectionType.HTTP]: "HTTP",
  [HttpInspectionType.HTTP308]: "HTTP moved permanently",
  [HttpInspectionType.HTTPRedirectsToHttps]: "HTTP Weiterleitung zu HTTPS",
  [TLSInspectionType.TLSv1_2]: "TLS 1.2",
  [TLSInspectionType.TLSv1_3]: "TLS 1.3",
  [TLSInspectionType.DeprecatedTLSDeactivated]:
    "Deaktivierung von veralteten TLS/ SSL Protokollen",
  [TLSInspectionType.StrongKeyExchange]: "Strong-Key-Exchange",
  [TLSInspectionType.StrongCipherSuites]: "Strong-Cipher-Suites",
  [CertificateInspectionType.ValidCertificate]: "Gültiges Zertifikat",
  [CertificateInspectionType.StrongPrivateKey]: "Starker-Private-Key",
  [CertificateInspectionType.StrongSignatureAlgorithm]:
    "Starker Signatur Algorithmus",
  [CertificateInspectionType.MatchesHostname]:
    "Hostname Übereinstimmung im Zertifikat",
  [CertificateInspectionType.NotRevoked]:
    "Zertifikat wurde nicht zurückgerufen",
  [CertificateInspectionType.CertificateTransparency]: "Zertifikattransparenz",
  [CertificateInspectionType.ValidCertificateChain]: "Gültige Zertifikatskette",
  [CookieInspectionType.SecureSessionCookies]: "Sichere Session Cookies",
  [NetworkInspectionType.IPv6]: "IPv6",
  [NetworkInspectionType.RPKI]: "RPKI",
  [DomainInspectionType.DNSSec]: "DNSSEC",
  [DomainInspectionType.CAA]: "CAA",
  [OrganizationalInspectionType.ResponsibleDisclosure]:
    "Responsible Disclosure",
  [ContentInspectionType.SubResourceIntegrity]: "Sub Resource Integrity",
  [ContentInspectionType.NoMixedContent]: "Kein Mixed Content",
  [HeaderInspectionType.HTTPS]: "HTTPS",
  [HeaderInspectionType.HSTS]: "HSTS",
  [HeaderInspectionType.HSTSPreloaded]: "HSTS Preloaded",
  [HeaderInspectionType.ContentSecurityPolicy]: "Content Security Policy",
  [HeaderInspectionType.XFrameOptions]: "X-Frame-Options",
  [HeaderInspectionType.XSSProtection]: "X-XSS-Protection",
  [HeaderInspectionType.ContentTypeOptions]: "Content-Type-Options",
};

const displayKey: Array<InspectionType> = [
  OrganizationalInspectionType.ResponsibleDisclosure,
  TLSInspectionType.TLSv1_3,
  TLSInspectionType.DeprecatedTLSDeactivated,
  HeaderInspectionType.HSTS,
  DomainInspectionType.DNSSec,
  NetworkInspectionType.RPKI,
];

const LabelComponent: FunctionComponent<any & { fill: string }> = (props) => {
  if (props.data?.length - 1 === +(props.index ?? 0)) {
    return (
      <VictoryLabel
        {...props}
        textAnchor={"end"}
        verticalAnchor={"middle"}
        dy={0}
        renderInPortal={true}
        dx={30}
        backgroundStyle={{
          fill: tailwindColors.deepblue["600"],
        }}
        style={{
          fontSize: 10,
          fill: props.fill,
        }}
      />
    );
  }
  return (
    <VictoryTooltip
      {...props}
      constrainToVisibleArea
      style={{
        fill: props.fill,
        fontSize: 10,
      }}
      flyoutPadding={2.5}
      flyoutStyle={{
        stroke: "none",
        fill: tailwindColors.deepblue["600"],
      }}
      dx={0}
      dy={-1.55}
      pointerLength={0}
    />
  );
};

const RefLabelComponent: FunctionComponent<any> = (props) => {
  const totalElements = props.data?.length - 1;
  const totalRefComponents = props.nRefComponents;
  // evenly space the labels
  const refComponentIndex =
    props.i * Math.floor(totalElements / totalRefComponents);
  if (refComponentIndex === +props.index) {
    return (
      <VictoryLabel
        {...props}
        renderInPortal={false}
        textAnchor={"middle"}
        verticalAnchor={"middle"}
        backgroundPadding={2}
        // make sure to never overlap with the y-axis
        dx={30}
        dy={-2}
        backgroundStyle={{
          fill: tailwindColors.deepblue["600"],
        }}
        style={{
          fontSize: 10,
          fill: tailwindColors.slate["400"],
        }}
      />
    );
  } else if (props.data.length - 1 === +(props.index ?? 0)) {
    return (
      <VictoryLabel
        {...props}
        renderInPortal={true}
        textAnchor={"end"}
        verticalAnchor={"middle"}
        backgroundPadding={3}
        dx={30}
        dy={0}
        style={{
          fontSize: 10,
          fill: tailwindColors.slate["400"],
        }}
      />
    );
  }
  return null;
};

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

const Dashboard: FunctionComponent<Props> = (props) => {
  const dashboard = props.dashboard;
  const currentStat = useMemo(
    () =>
      props.defaultCollectionId in dashboard.historicalData
        ? dashboard.historicalData[props.defaultCollectionId].series[
            dashboard.historicalData[props.defaultCollectionId].series.length -
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

  const [data, setData] = useState({
    totalCount: currentStat.totalCount,
    data: Object.fromEntries(
      Object.keys(currentStat.data).map((key) => [key, 0])
    ),
  });

  useEffect(() => {
    setData(currentStat);
  }, [currentStat]);

  const dataPerDisplayKey = useMemo(
    () =>
      Object.fromEntries(
        displayKey.map((key) => {
          const data = Object.fromEntries(
            Object.entries(dashboard.historicalData).map(
              ([collectionId, stat]) => {
                return [
                  collectionId,
                  {
                    title: stat.title,
                    color: stat.color,
                    series: stat.series.map((item) => {
                      return {
                        y: item.data[key] * 100,
                        x: new Date(item.date).toLocaleDateString(
                          "de-DE",
                          dateFormat
                        ),
                      };
                    }),
                  },
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
    [dashboard.historicalData]
  );

  const handleDisplayCollectionToggle = (collectionId: number) => {
    if (displayCollections.includes(collectionId)) {
      // check if there is at least one collection left
      if (displayCollections.length === 1) {
        setDisplayCollections([props.defaultCollectionId]);
      }
      setDisplayCollections((prev) => prev.filter((id) => id !== collectionId));
    } else {
      setDisplayCollections((prev) => prev.concat(collectionId));
    }
  };

  return (
    <>
      <DashboardPage keycloakIssuer={props.keycloakIssuer} title="Dashboard">
        <SideNavigation />
        <div className="flex-1 text-white mb-10">
          <h1 className="text-4xl mb-5 font-bold">Dashboard</h1>
          <p className="w-2/3 text-slate-300">
            Das Dashboard zeigt Ihnen aggregierte Informationen über den
            Sicherheitszustand der von Ihnen verwalteten OZG-Dienste.
          </p>
          <div>
            <h2 className="text-2xl mt-10">Gesamtanzahl der Dienste</h2>
            <div className="flex mt-5 justify-start flex-wrap flex-wrap flex-row">
              <div>
                <div className="bg-deepblue-600 flex-row flex mr-2 items-center p-5 border border-deepblue-100">
                  <FontAwesomeIcon
                    className="text-slate-400 mx-2"
                    fontSize={75}
                    icon={faListCheck}
                  />
                  <div className="ml-5 text-xl">
                    <b className="text-5xl">{dashboard.totals.uniqueTargets}</b>
                    <br />
                    Domains
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row mt-10  items-center justify-between">
            <div>
              <h2 className="text-2xl mb-5">Testergebnisse</h2>
              <p className="w-2/3 text-slate-300">
                Ausschlie&szlig;lich erreichbare Domains können getestet werden.
                Die Anfrage muss vom Server in maximal zehn Sekunden beantwortet
                werden, damit eine Domain als erreichbar gilt. Derzeit sind{" "}
                {currentStat.totalCount} von {dashboard.totals.uniqueTargets}{" "}
                erreichbar.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex flex-row mb-4">
              <CollectionMenu
                selectedCollections={displayCollections}
                onCollectionClick={({ id }) => {
                  handleDisplayCollectionToggle(id);
                }}
                collections={props.collections}
                Button={
                  <div className="bg-deepblue-200 p-2 whitespace-nowrap">
                    Sammlungen anzeigen{" "}
                    <FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                  </div>
                }
              />
            </div>
            <div className="flex flex-wrap flex-row gap-2 items-center justify-start">
              {displayCollections.map((id) => {
                const col = props.collections[id];
                return (
                  <CollectionPill
                    onRemove={() => {
                      handleDisplayCollectionToggle(id);
                    }}
                    key={col.id}
                    {...col}
                    title={
                      id === props.defaultCollectionId ? "Alle" : col.title
                    }
                    color={
                      id === props.defaultCollectionId
                        ? tailwindColors.lightning["500"]
                        : col.color
                    }
                  />
                );
              })}
            </div>
          </div>
          <div className="flex mt-5 justify-start gap-2 flex-wrap flex-row">
            {displayKey.map((key) => {
              const percentage = currentStat.data[key] * 100;
              let padAngle = 3;
              // If the percentage is too small, don't show the padAngle
              if (100 - percentage < 1.5 || percentage < 1.5) {
                padAngle = 0;
              }

              const refData = displayCollections
                .filter((c) => c !== props.defaultCollectionId)
                .map((collection) => {
                  const ref = dashboard.historicalData[collection];

                  return {
                    title: ref.title,
                    color: ref.color,
                    percentage:
                      ref.series[ref.series.length - 1].data[key] * 100,
                  };
                });
              return (
                <div
                  className="w-56 bg-deepblue-600 border flex-col flex border-deepblue-100"
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
                        &quot;{mapping[key]}&quot; jetzt umsetzen!
                      </a>
                    )}
                    <VictoryChart
                      prependDefaultAxes={false}
                      width={300}
                      height={300}
                    >
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
                        animate={{
                          duration: 500,
                        }}
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
                            x: `Implementiert (${(data.data[key] * 100).toFixed(
                              1
                            )}%)`,
                            y: data.totalCount * data.data[key],
                          },
                          {
                            x:
                              data.totalCount === 0
                                ? "Keine Testergebnisse vorhanden"
                                : `Fehlerhaft (${(
                                    (1 - data.data[key] || 1) * 100
                                  ).toFixed(1)}%)`,
                            y:
                              data.totalCount === 0
                                ? 100
                                : data.totalCount * (1 - data.data[key]),
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
                    title={mapping[key]}
                    className="text-center whitespace-nowrap text-ellipsis overflow-hidden bg-deepblue-400 border-t border-deepblue-50 mt-1 p-3"
                  >
                    {mapping[key]}
                  </h2>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl mt-10 mb-5">Trendanalyse</h2>
          <div className="justify-between items-start">
            <p className="w-2/3 mb-10 text-slate-300">
              Die Trendanalyse visualisiert die Veränderung der
              Sicherheitskriterien in Anbetracht der Zeit. Zusätzlich stellt sie
              die Werte der verwalteten Dienste im Vergleich zu den Werten der
              Top 100.000 .de Domains sowie der globalen Top 100.000 Domains
              dar. Die Daten werden täglich aktualisiert.
            </p>
          </div>
          <div className="flex mt-5 justify-start -mx-2 flex-wrap flex-row">
            {displayKey.map((key) => {
              const { data, min, max } = dataPerDisplayKey[key];
              return (
                <div className="xl:w-1/3 sm:w-1/2 w-full mb-5" key={key}>
                  <div className="bg-deepblue-600 mx-2 historical-chart border flex-col flex border-deepblue-100">
                    <div className="flex-1 pt-5 relative">
                      {linkMapper[key] !== "" && (
                        <Link
                          target={"_blank"}
                          href={linkMapper[key]}
                          className="text-sm absolute w-full inline-block overflow-hidden truncate text-right whitespace-nowrap top-1 underline right-0 mt-2 px-5"
                        >
                          &quot;{mapping[key]}&quot; jetzt umsetzen!
                        </Link>
                      )}
                      <svg style={{ height: 0 }}>
                        <defs>
                          <linearGradient
                            x2="0%"
                            y2="100%"
                            id="serviceGradient"
                          >
                            <stop
                              offset="0%"
                              stopColor={"rgba(172,252,207,0.2)"}
                            />

                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <VictoryChart
                        containerComponent={
                          <VictoryVoronoiContainer
                            width={330}
                            voronoiDimension="x"
                          />
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
                        {displayCollections.map((collectionId) => {
                          const d = data[collectionId];
                          const color =
                            +collectionId === props.defaultCollectionId
                              ? tailwindColors.lightning["500"]
                              : d.color;
                          return (
                            <VictoryLine
                              key={collectionId}
                              animate
                              style={{
                                data: {
                                  strokeLinecap: "round",
                                  stroke: color,
                                },
                              }}
                              interpolation={"basis"}
                              labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                              labelComponent={<LabelComponent fill={color} />}
                              data={d.series}
                            />
                          );
                        })}
                      </VictoryChart>
                    </div>
                    <h2
                      title={mapping[key]}
                      className="text-center whitespace-nowrap text-ellipsis overflow-hidden border-t border-deepblue-50 bg-deepblue-400 mt-1 p-3"
                    >
                      {mapping[key]}
                    </h2>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardPage>
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (_context, [currentUser, prisma]): Promise<ServerSideProps<Props>> => {
    const [dashboard, referenceChartData, collections] = await Promise.all([
      statService.getDashboardForUser(currentUser, prisma),
      statService.getReferenceChartData(prisma),
      collectionService.getAllCollectionsOfUser(currentUser, prisma, true),
    ]);

    return {
      props: {
        dashboard: replaceNullWithZero({
          ...dashboard,
          historicalData: {
            ...dashboard.historicalData,
            ...referenceChartData,
          },
        }),
        keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
        defaultCollectionId: currentUser.defaultCollectionId,
        refCollections: config.generateStatsForCollections,
        collections: normalizeToMap(toDTO(collections), "id"),
      },
    };
  },
  withCurrentUserServerSideProps,
  withDB
);

export default Dashboard;
