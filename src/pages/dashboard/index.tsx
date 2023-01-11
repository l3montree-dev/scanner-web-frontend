import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { FunctionComponent, useEffect, useState } from "react";
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
import { withTokenServerSideProps } from "../../decorators/withToken";
import { useSession } from "../../hooks/useSession";
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
import { dashboardService } from "../../services/dashboardService";
import { theme } from "../../styles/victory-theme";
import { IDashboard } from "../../types";
import { isAdmin, linkMapper } from "../../utils/common";

interface Props extends IDashboard {}

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

const Dashboard: FunctionComponent<Props> = (props) => {
  const [data, setData] = useState({
    totalCount: props.currentState.totalCount,
    data: Object.fromEntries(
      Object.keys(props.currentState.data).map((key) => [key, 0])
    ),
  });

  useEffect(() => {
    setData(props.currentState);
  }, [props.currentState]);

  return (
    <>
      <DashboardPage title="Dashboard">
        <SideNavigation />
        <div className="flex-1 text-white mb-10">
          <h1 className="text-4xl mb-5 font-bold">Dashboard</h1>
          <p className="w-1/2 text-slate-300">
            Das Dashboard zeigt Ihnen aggregierte Informationen über den
            Sicherheitszustand der von Ihnen verwalteten OZG-Dienste.
          </p>
          <div>
            <h2 className="text-2xl mt-10">Gesamtanzahl der Dienste</h2>
            <div className="flex mt-5 justify-start flex-wrap flex-wrap flex-row">
              <div>
                <div className="bg-deepblue-500 flex-row flex mr-2 items-center p-5 border border-deepblue-200">
                  <FontAwesomeIcon
                    className="text-slate-400 mx-2"
                    fontSize={75}
                    icon={faServer}
                  />
                  <div className="ml-5 text-xl">
                    <b className="text-5xl">{props.totals.uniqueDomains}</b>
                    <br />
                    Domains
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl mt-10 mb-5">Testergebnisse</h2>
          <p className="w-1/2 text-slate-300">
            Ausschlie&szlig;lich erreichbare Domains können getestet werden. Die
            Anfrage muss vom Server in maximal zehn Sekunden beantwortet werden,
            damit eine Domain als erreichbar gilt. Derzeit sind{" "}
            {props.currentState.totalCount} von {props.totals.uniqueDomains}{" "}
            erreichbar.
          </p>
          <div className="flex mt-5 justify-start gap-2 flex-wrap flex-wrap flex-row">
            {displayKey.map((key) => {
              const percentage =
                (props.currentState.data[key] /
                  (props.currentState.totalCount || 1)) *
                100;
              let padAngle = 3;

              // If the percentage is too small, don't show the padAngle
              if (100 - percentage < 1.5 || percentage < 1.5) {
                padAngle = 0;
              }
              return (
                <div
                  className="w-56 bg-deepblue-500 border flex-col flex border-deepblue-200"
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
                            }}
                            flyoutStyle={{
                              stroke: "none",
                              fill: (fullConfig.theme?.colors as any).deepblue[
                                "50"
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
                            x: `Implementiert (${(
                              (data.data[key] / data.totalCount) *
                              100
                            ).toFixed(1)}%)`,
                            y: data.data[key],
                          },
                          {
                            x: `Fehlerhaft (${(
                              ((data.totalCount - data.data[key]) /
                                data.totalCount) *
                              100
                            ).toFixed(1)}%)`,
                            y: data.totalCount - data.data[key],
                          },
                        ]}
                      />
                      <VictoryLabel
                        textAnchor="middle"
                        style={{ fontSize: 30, fill: "white" }}
                        x={150}
                        y={145}
                        text={`${(
                          (props.currentState.data[key] /
                            (props.currentState.totalCount || 1)) *
                          100
                        ).toFixed(0)}%`}
                      />
                      <VictoryLabel
                        textAnchor="middle"
                        style={{
                          fontSize: 20,
                          fill: (fullConfig.theme?.colors as any).slate["400"],
                        }}
                        x={150}
                        y={175}
                        text={`${props.currentState.data[key]} von ${props.currentState.totalCount}`}
                      />
                    </svg>
                  </div>
                  <h2
                    title={mapping[key]}
                    className="text-center whitespace-nowrap text-ellipsis overflow-hidden bg-deepblue-200 mt-1 p-3"
                  >
                    {mapping[key]}
                  </h2>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl mt-10 mb-5">Trendanalyse</h2>
          <p className="w-1/2 text-slate-300">
            Ausschlie&szlig;lich erreichbare Domains können getestet werden. Die
            Anfrage muss vom Server in maximal zehn Sekunden beantwortet werden,
            damit eine Domain als erreichbar gilt. Derzeit sind{" "}
            {props.currentState.totalCount} von {props.totals.uniqueDomains}{" "}
            erreichbar.
          </p>

          <div className="flex mt-5 justify-start -mx-2 flex-wrap flex-row">
            {displayKey.map((key) => {
              const data = props.historicalData.map((item) => {
                return {
                  y: (item.data[key] / (item.totalCount || 1)) * 100,
                  x: new Date(item.date).toLocaleDateString(),
                };
              });
              return (
                <div className="w-1/3 mb-5" key={key}>
                  <div className="bg-deepblue-500 mx-2 historical-chart border flex-col flex border-deepblue-200">
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
                          <linearGradient x2="0%" y2="100%" id="myGradient">
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
                          <VictoryVoronoiContainer voronoiDimension="x" />
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
                          interpolation={"basis"}
                          animate={{
                            duration: 250,
                          }}
                          labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                          labelComponent={
                            <VictoryTooltip
                              constrainToVisibleArea
                              cornerRadius={0}
                              style={{
                                fill: "white",
                              }}
                              flyoutStyle={{
                                stroke: "none",
                                fill: (fullConfig.theme?.colors as any)
                                  .deepblue["50"],
                              }}
                              dx={0}
                              pointerLength={0}
                            />
                          }
                          colorScale={[
                            (fullConfig.theme?.colors as any).lightning["500"],
                            (fullConfig.theme?.colors as any).slate["600"],
                          ]}
                          data={data}
                        />
                        <VictoryArea
                          style={{
                            data: { fill: "url(#myGradient)" },
                          }}
                          interpolation={"basis"}
                          animate={{
                            duration: 250,
                          }}
                          labels={({ datum }) => `${datum.y.toFixed(1)}%`}
                          labelComponent={
                            <VictoryTooltip
                              constrainToVisibleArea
                              cornerRadius={0}
                              style={{
                                fill: "white",
                              }}
                              flyoutStyle={{
                                stroke: "none",
                                fill: (fullConfig.theme?.colors as any)
                                  .deepblue["50"],
                              }}
                              dx={0}
                              pointerLength={0}
                            />
                          }
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
                      className="text-center whitespace-nowrap text-ellipsis overflow-hidden bg-deepblue-200 mt-1 p-3"
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
    const dashboard = await dashboardService.staleWhileRevalidate(
      currentUser,
      prisma
    );

    return {
      props: dashboard.content as unknown as IDashboard,
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
