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
import { getFailedSuccessPercentage } from "../../services/statService";
import { isAdmin } from "../../utils/common";
interface Props {
  totalCount: number;
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
  [TLSInspectionType.SSLDeactivated]: "",
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
    data: Object.fromEntries(Object.keys(props.data).map((key) => [key, 0])),
  });

  useEffect(() => {
    setData(props);
  }, []);

  return (
    <>
      <DashboardPage title="Dashboard">
        <SideNavigation />
        <div className="flex-1 text-white">
          <h1 className="text-4xl font-bold">Dashboard</h1>

          <div className="flex mt-5 justify-center items-start flex-wrap p-2 flex-row">
            {displayKey.map((key) => (
              <div className="flex-1" key={key}>
                <svg viewBox="0 0 300 300">
                  <VictoryPie
                    standalone={false}
                    width={300}
                    height={300}
                    animate={true}
                    innerRadius={60}
                    labelComponent={
                      <VictoryTooltip
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
                        dx={10}
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
                    style={{ fontSize: 24, fill: "white" }}
                    x={150}
                    y={150}
                    text={`${(
                      (props.data[key] / props.totalCount) *
                      100
                    ).toFixed(0)}%`}
                  />
                </svg>
                <h2 className="text-center">{mapping[key]}</h2>
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
    // get the query params.
    const page = +(context.query["page"] ?? 0);
    const search = context.query["search"] as string | undefined;

    return {
      props: {
        ...(await getFailedSuccessPercentage(
          isAdmin(token),
          currentUser.networks,
          db.Report
        )),
      },
    };
  },
  withCurrentUser,
  withTokenServerSideProps,
  withDB
);

export default Dashboard;
