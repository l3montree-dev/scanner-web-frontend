import {
  faListCheck,
  faNetworkWired,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { FunctionComponent, useEffect, useState } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import { VictoryLabel, VictoryPie, VictoryTooltip } from "victory";
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
import {
  getFailedSuccessPercentage,
  getTotals,
} from "../../services/statService";
import { isAdmin, linkMapper } from "../../utils/common";
interface Props {
  totalCount: number;
  hosts: number;
  ipAddresses: number;
  data: {
    [key in InspectionType]: number;
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

const Dashboard: FunctionComponent<Props> = (props) => {
  const [data, setData] = useState({
    totalCount: props.totalCount,
    hosts: props.hosts,
    ipAddresses: props.ipAddresses,
    data: Object.fromEntries(Object.keys(props.data).map((key) => [key, 0])),
  });

  const user = useSession();

  useEffect(() => {
    setData(props);
  }, []);

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
              <div className="mr-2">
                <div className="bg-deepblue-500 flex-row flex items-center p-5 border border-deepblue-200">
                  <FontAwesomeIcon
                    className="text-slate-400 mx-2"
                    fontSize={75}
                    icon={faListCheck}
                  />
                  <div className="ml-5 text-xl">
                    <b className="text-5xl">{data.hosts}</b>
                    <br />
                    DNS-Einträge
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-deepblue-500 flex-row flex mr-2 items-center p-5 border border-deepblue-200">
                  <FontAwesomeIcon
                    className="text-slate-400 mx-2"
                    fontSize={75}
                    icon={faServer}
                  />
                  <div className="ml-5 text-xl">
                    <b className="text-5xl">{data.ipAddresses}</b>
                    <br />
                    IP-Adressen
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-deepblue-500 h-full flex-row flex items-center p-5 border border-deepblue-200">
                  <FontAwesomeIcon
                    className="text-slate-400 mx-2"
                    fontSize={75}
                    icon={faNetworkWired}
                  />
                  <div className="ml-5">
                    <div className="flex mb-2 gap-2 flex-wrap flex-row">
                      {user.data?.user.networks.map((network) => (
                        <div
                          className="bg-deepblue-200 border border-deepblue-200 px-2 py-1"
                          key={network.id}
                        >
                          <div>
                            <b>{network.cidr}</b>
                            <br />
                          </div>
                        </div>
                      ))}
                    </div>

                    <span className="text-xl">Verwaltete Netzwerke</span>
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
            {props.totalCount} von {props.hosts} erreichbar.
          </p>
          <div className="flex mt-5 justify-start gap-2 flex-wrap flex-wrap flex-row">
            {displayKey.map((key) => (
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
                      padAngle={3}
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
                      y={150}
                      text={`${(
                        (props.data[key] / (props.totalCount || 1)) *
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
                      y={180}
                      text={`${props.data[key]} von ${props.totalCount}`}
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
            ))}
          </div>
        </div>
      </DashboardPage>
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, token, db]) => {
    const admin = isAdmin(token);
    const [data, { hosts, ipAddresses }] = await Promise.all([
      getFailedSuccessPercentage(admin, currentUser.networks, db.Report),
      getTotals(admin, currentUser.networks, db.Domain),
    ]);

    return {
      props: {
        ...data,
        hosts,
        ipAddresses,
      },
    };
  },
  withCurrentUser,
  withTokenServerSideProps,
  withDB
);

export default Dashboard;
