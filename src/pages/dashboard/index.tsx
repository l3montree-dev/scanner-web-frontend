import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import {
  Fragment,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
} from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
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
  referenceChartData: {
    [referenceName: string]: Array<ChartData & { date: number }>;
  };
}

const fullConfig = resolveConfig(tailwindConfig);

const mapping: { [key in InspectionType]: string } = {
  [HttpInspectionType.HTTP]: "",
  [HttpInspectionType.HTTP308]: "",
  [HttpInspectionType.HTTPRedirectsToHttps]: "",
  [TLSInspectionType.TLSv1_2]: "",
  [TLSInspectionType.TLSv1_3]: "TLS 1.3",
  [TLSInspectionType.TLSv1_1_Deactivated]:
    "Deaktivierung von veralteten TLS/ SSL Protokollen",
  [TLSInspectionType.StrongKeyExchange]: "",
  [TLSInspectionType.StrongCipherSuites]: "",
  [CertificateInspectionType.ValidCertificate]: "",
  [CertificateInspectionType.StrongPrivateKey]: "",
  [CertificateInspectionType.StrongSignatureAlgorithm]: "",
  [CertificateInspectionType.MatchesHostname]: "",
  [CertificateInspectionType.NotRevoked]: "",
  [CertificateInspectionType.CertificateTransparency]: "",
  [CertificateInspectionType.ValidCertificateChain]: "",
  [CookieInspectionType.SecureSessionCookies]: "",
  [NetworkInspectionType.IPv6]: "",
  [NetworkInspectionType.RPKI]: "RPKI",
  [DomainInspectionType.DNSSec]: "DNSSEC",
  [DomainInspectionType.CAA]: "",
  [OrganizationalInspectionType.ResponsibleDisclosure]:
    "Responsible Disclosure",
  [ContentInspectionType.SubResourceIntegrity]: "",
  [ContentInspectionType.NoMixedContent]: "",
  [HeaderInspectionType.HTTPS]: "",
  [HeaderInspectionType.HSTS]: "HSTS",
  [HeaderInspectionType.HSTSPreloaded]: "",
  [HeaderInspectionType.ContentSecurityPolicy]: "",
  [HeaderInspectionType.XFrameOptions]: "",
  [HeaderInspectionType.XSSProtection]: "",
  [HeaderInspectionType.ContentTypeOptions]: "",
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
    name: ".de Top 100.000",
    color: (fullConfig.theme?.colors as any).yellow["500"],
  },
  top_100000: {
    name: "Top 100.000",
    color: (fullConfig.theme?.colors as any).red["500"],
  },
};

function hexToRgbA(hex: string): string {
  var c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = `0x${c.join("")}`;
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",")},0.2)`;
  }
  throw new Error("Bad Hex");
}

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
          return [
            key,
            {
              data,
              referenceData,
            },
          ];
        })
      ),
    [props.referenceChartData, dashboard.historicalData]
  );

  return (
    <>
      <DashboardPage title="Dashboard">
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
                <div className="bg-deepblue-500 flex-row flex mr-2 items-center p-5 border border-deepblue-50">
                  <FontAwesomeIcon
                    className="text-slate-400 mx-2"
                    fontSize={75}
                    icon={faListCheck}
                  />
                  <div className="ml-5 text-xl">
                    <b className="text-5xl">{dashboard.totals.uniqueDomains}</b>
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
            {dashboard.totals.uniqueDomains} erreichbar.
          </p>
          <div className="flex mt-5 justify-start gap-2 flex-wrap flex-wrap flex-row">
            {displayKey.map((key) => {
              const percentage = dashboard.currentState.data[key] * 100;
              let padAngle = 3;
              // If the percentage is too small, don't show the padAngle
              if (100 - percentage < 1.5 || percentage < 1.5) {
                padAngle = 0;
              }
              return (
                <div
                  className="w-56 bg-deepblue-500 border flex-col flex border-deepblue-50"
                  key={key}
                >
                  <div className="flex-1 pt-5 relative">
                    {linkMapper[key] !== "" && (
                      <Link
                        target={"_blank"}
                        href={linkMapper[key]}
                        className="text-sm absolute top-1 underline right-0 mt-2 mr-3"
                      >
                        Mehr Informationen
                      </Link>
                    )}
                    <svg viewBox="0 0 300 300">
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
                            constrainToVisibleArea
                            cornerRadius={0}
                            style={{
                              fill: "white",
                              fontSize: 14,
                            }}
                            flyoutStyle={{
                              stroke: "none",
                              fill: (fullConfig.theme?.colors as any).deepblue[
                                "500"
                              ],
                            }}
                            dx={0}
                            pointerLength={0}
                          />
                        }
                        colorScale={[
                          (fullConfig.theme?.colors as any).lightning["500"],
                          (fullConfig.theme?.colors as any).slate["600"],
                        ]}
                        data={[
                          {
                            x: `Implementiert (${(data.data[key] * 100).toFixed(
                              1
                            )}%)`,
                            y: data.totalCount * data.data[key],
                          },
                          {
                            x: `Fehlerhaft (${(
                              (1 - data.data[key]) *
                              100
                            ).toFixed(1)}%)`,
                            y: data.totalCount * (1 - data.data[key]),
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
                        ).toFixed(0)}%`}
                      />
                    </svg>
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
              Top 100.000 .de Domains sowie der Top 100.000 Domains dar. Die
              Daten werden regelmä&szlig;ig aktualisiert.
            </p>

            <div className="w-1/3">
              <div className="px-2 py-2 text-slate-300 mr-3 bg-deepblue-400 border-deepblue-50 border">
                <span className="mb-2 text-lg block">Legende</span>
                <div className="text-sm">
                  <div className="flex-row flex items-center">
                    <div className="w-3 h-3 bg-lightning-500 rounded-full"></div>
                    <span className="ml-2">Verwaltete Dienste</span>
                  </div>
                  {Object.keys(props.referenceChartData).map(
                    (referenceName) => (
                      <div
                        key={referenceName}
                        className="flex-row mt-2 flex items-center"
                      >
                        <div
                          style={{
                            backgroundColor:
                              referenceNameMapping[referenceName].color,
                          }}
                          className="w-3 h-3 rounded-full"
                        ></div>
                        <span className="ml-2">
                          {referenceNameMapping[referenceName].name}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex mt-5 justify-start -mx-2 flex-wrap flex-row">
            {displayKey.map((key) => {
              const { data, referenceData } = dataPerDisplayKey[key];
              return (
                <div className="xl:w-1/3 sm:w-1/2 w-full mb-5" key={key}>
                  <div className="bg-deepblue-500 mx-2 historical-chart border flex-col flex border-deepblue-50">
                    <div className="flex-1 pt-5 relative">
                      {linkMapper[key] !== "" && (
                        <Link
                          target={"_blank"}
                          href={linkMapper[key]}
                          className="text-sm absolute top-1 underline right-0 mt-2 mr-3"
                        >
                          Mehr Informationen
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
                        domainPadding={[0, 10]}
                      >
                        <VictoryAxis fixLabelOverlap />
                        <VictoryAxis
                          tickFormat={(t) => `${t}%`}
                          dependentAxis
                          fixLabelOverlap
                        />

                        <VictoryLine
                          animate
                          interpolation={"basis"}
                          labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                          labelComponent={
                            <VictoryTooltip
                              constrainToVisibleArea
                              cornerRadius={0}
                              style={{
                                fill: (fullConfig.theme?.colors as any)
                                  .lightning["200"],
                                fontSize: 12,
                              }}
                              flyoutPadding={2.5}
                              flyoutStyle={{
                                stroke: "none",
                                fill: (fullConfig.theme?.colors as any)
                                  .deepblue["500"],
                              }}
                              dx={0}
                              dy={-5}
                              pointerLength={0}
                            />
                          }
                          colorScale={[
                            (fullConfig.theme?.colors as any).lightning["500"],
                            (fullConfig.theme?.colors as any).slate["600"],
                          ]}
                          data={data}
                        />

                        {Object.entries(referenceData).map(
                          ([referenceName, value], i) => (
                            <VictoryLine
                              interpolation={"basis"}
                              style={{
                                data: {
                                  stroke:
                                    referenceNameMapping[referenceName].color,
                                  strokeWidth: 1.5,
                                },
                                parent: { border: "1px solid #ccc" },
                              }}
                              key={referenceName}
                              data={value}
                              labels={(d) => {
                                if (+d.index === value.length - 1) {
                                  return `
                                    ${d.datum.y.toFixed(1)}%`;
                                }
                                return null;
                              }}
                              labelComponent={
                                <VictoryLabel
                                  textAnchor={"end"}
                                  verticalAnchor={"start"}
                                  backgroundPadding={3}
                                  style={{
                                    fontSize: 10,
                                    fill: referenceNameMapping[referenceName]
                                      .color,
                                  }}
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
                            (fullConfig.theme?.colors as any).lightning["500"],
                            (fullConfig.theme?.colors as any).slate["600"],
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
      },
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
