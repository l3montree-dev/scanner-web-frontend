import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import tailwindConfig from "../../../tailwind.config.js";
import DashboardPage from "../../components/DashboardPage";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUser } from "../../decorators/withCurrentUser";
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
import { statService } from "../../services/statService";
import { theme } from "../../styles/victory-theme";
import { ChartData, IDashboard } from "../../types";
import { dateFormat, linkMapper } from "../../utils/common";

interface Props {
  dashboard: IDashboard;
  keycloakIssuer: string;
  referenceChartData: {
    [referenceName: string]: Array<ChartData & { date: number }>;
  };
}

const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = (fullConfig.theme as any).colors;

const mapping: { [key in InspectionType]: string } = {
  [HttpInspectionType.HTTP]: "HTTP",
  [HttpInspectionType.HTTP308]: "HTTP moved permanently",
  [HttpInspectionType.HTTPRedirectsToHttps]: "HTTP Weiterleitung zu HTTPS",
  [TLSInspectionType.TLSv1_2]: "TLS 1.2",
  [TLSInspectionType.TLSv1_3]: "TLS 1.3",
  [TLSInspectionType.TLSv1_1_Deactivated]:
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
  TLSInspectionType.TLSv1_1_Deactivated,
  HeaderInspectionType.HSTS,
  DomainInspectionType.DNSSec,
  NetworkInspectionType.RPKI,
];

const referenceNameMapping: {
  [key: string]: {
    name: string;
    color: string;
  };
} = {
  de_top_100000: {
    name: ".de",
    color: tailwindColors.slate["400"],
  },
  top_100000: {
    name: "global",
    color: tailwindColors.slate["400"],
  },
};

const LabelComponent: FunctionComponent<any> = (props) => {
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
          fill: tailwindColors.lightning["200"],
        }}
      />
    );
  }
  return (
    <VictoryTooltip
      {...props}
      constrainToVisibleArea
      style={{
        fill: tailwindColors.lightning["200"],
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
  const [data, setData] = useState({
    totalCount: dashboard.currentState.totalCount,
    data: Object.fromEntries(
      Object.keys(dashboard.currentState.data).map((key) => [key, 0])
    ),
  });

  useEffect(() => {
    setData(dashboard.currentState);
  }, [dashboard.currentState]);

  const dataPerDisplayKey = useMemo(
    () =>
      Object.fromEntries(
        displayKey.map((key) => {
          const data = dashboard.historicalData.map((item) => {
            return {
              y: item.data[key] * 100,
              x: new Date(item.date).toLocaleDateString("de-DE", dateFormat),
            };
          });
          const referenceData = Object.fromEntries(
            Object.entries(props.referenceChartData).map(
              ([groupName, item]) => {
                return [
                  groupName,
                  item.map((item) => {
                    return {
                      y: item.data[key] * 100,
                      x: new Date(item.date).toLocaleDateString(
                        "de-DE",
                        dateFormat
                      ),
                    };
                  }),
                ];
              }
            )
          );

          const min = Math.min(
            ...data.map((item) => item.y),
            ...Object.values(referenceData)
              .flat()
              .map((item) => item.y)
          );
          const max = Math.max(
            ...data.map((item) => item.y),
            ...Object.values(referenceData)
              .flat()
              .map((item) => item.y)
          );

          return [
            key,
            {
              data,
              referenceData,
              min,
              max,
            },
          ];
        })
      ),
    [props.referenceChartData, dashboard.historicalData]
  );

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
                <div className="bg-deepblue-600 flex-row flex mr-2 items-center p-5 border border-deepblue-50">
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
          <h2 className="text-2xl mt-10 mb-5">Testergebnisse</h2>
          <p className="w-2/3 text-slate-300">
            Ausschlie&szlig;lich erreichbare Domains können getestet werden. Die
            Anfrage muss vom Server in maximal zehn Sekunden beantwortet werden,
            damit eine Domain als erreichbar gilt. Derzeit sind{" "}
            {dashboard.currentState.totalCount} von{" "}
            {dashboard.totals.uniqueTargets} erreichbar.
          </p>
          <div className="flex mt-5 justify-start gap-2 flex-wrap flex-wrap flex-row">
            {displayKey.map((key) => {
              const percentage = dashboard.currentState.data[key] * 100;
              let padAngle = 3;
              // If the percentage is too small, don't show the padAngle
              if (100 - percentage < 1.5 || percentage < 1.5) {
                padAngle = 0;
              }

              const refData = Object.entries(
                dataPerDisplayKey[key].referenceData
              ).map(([groupName, data]) => {
                return [groupName, data[data.length - 1].y];
              });
              return (
                <div
                  className="w-56 bg-deepblue-600 border flex-col flex border-deepblue-50"
                  key={key}
                >
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
                        text={`${(
                          dashboard.currentState.data[key] * 100
                        ).toFixed(1)}%`}
                      />
                      {refData.map(([groupName, value], i) => {
                        return (
                          <g key={groupName}>
                            <line
                              x1={percentageToXInPieChart(+value, 110)}
                              y1={percentageToYInPieChart(+value, 110)}
                              x2={percentageToXInPieChart(+value, 80)}
                              y2={percentageToYInPieChart(+value, 80)}
                              style={{
                                stroke: referenceNameMapping[groupName].color,
                                strokeWidth: 2,
                              }}
                            />
                            <VictoryLabel
                              textAnchor="middle"
                              x={percentageToXInPieChart(
                                +value,
                                i % 2 == 0 ? 70 : 130
                              )}
                              y={percentageToYInPieChart(
                                +value,
                                i % 2 == 0 ? 70 : 130
                              )}
                              style={{
                                fontSize: 16,
                                fill: referenceNameMapping[groupName].color,
                              }}
                              text={`${referenceNameMapping[groupName].name}`}
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
              const { data, referenceData, min, max } = dataPerDisplayKey[key];
              return (
                <div className="xl:w-1/3 sm:w-1/2 w-full mb-5" key={key}>
                  <div className="bg-deepblue-600 mx-2 historical-chart border flex-col flex border-deepblue-50">
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
                        <VictoryLine
                          animate
                          style={{
                            data: { strokeLinecap: "round" },
                          }}
                          interpolation={"basis"}
                          labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                          labelComponent={<LabelComponent />}
                          colorScale={[
                            tailwindColors.lightning["500"],
                            tailwindColors.slate["600"],
                          ]}
                          data={data}
                        />
                        {Object.entries(referenceData).map(
                          ([referenceName, value], i, arr) => (
                            <VictoryLine
                              interpolation={"basis"}
                              style={{
                                data: {
                                  stroke:
                                    referenceNameMapping[referenceName].color,
                                  strokeWidth: 1.5,
                                  strokeLinecap: "round",
                                },
                                parent: { border: "1px solid #ccc" },
                              }}
                              key={referenceName}
                              data={value}
                              labels={(d) => {
                                if (+d.index === value.length - 1) {
                                  return `${d.datum.y.toFixed(1)}%`;
                                }
                                return referenceNameMapping[referenceName].name;
                              }}
                              labelComponent={
                                <RefLabelComponent
                                  nRefComponents={arr.length}
                                  i={i}
                                />
                              }
                            />
                          )
                        )}

                        <VictoryArea
                          style={{
                            data: { fill: "url(#serviceGradient)" },
                          }}
                          animate
                          interpolation={"basis"}
                          colorScale={[
                            tailwindColors.lightning["500"],
                            tailwindColors.slate["600"],
                          ]}
                          data={data}
                        />
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
  async (_context, [currentUser, prisma]) => {
    const [dashboard, referenceChartData] = await Promise.all([
      statService.getDashboardForUser(currentUser, prisma),
      statService.getReferenceChartData(prisma),
    ]);

    return {
      props: {
        dashboard,
        referenceChartData,
        keycloakIssuer: process.env.KEYCLOAK_ISSUER,
      },
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
