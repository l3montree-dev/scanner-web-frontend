import { FunctionComponent } from "react";
import { VictoryChart, VictoryPie, VictoryTooltip } from "victory";
import DashboardPage from "../../components/DashboardPage";
import SideNavigation from "../../components/SideNavigation";
import { WithId } from "../../db/models";
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
import { getDomainsOfNetworksWithLatestTestResult } from "../../services/domainService";
import { getFailedSuccessPercentage } from "../../services/statService";
import { IDomain, IReport, PaginateResult } from "../../types";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config.js";
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
  return (
    <>
      <DashboardPage title="Dashboard">
        <SideNavigation />
        <div className="flex-1 text-white">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex mt-5 justify-center items-center flex-wrap bg-deepblue-400 p-2 w-1/2 flex-row">
            {displayKey.map((key) => (
              <div className="w-40" key={key}>
                <h2 className="font-bold text-center">{mapping[key]}</h2>
                <VictoryPie
                  width={200}
                  height={200}
                  labelComponent={
                    <VictoryTooltip
                      cornerRadius={0}
                      style={{
                        fill: "white",
                      }}
                      flyoutStyle={{
                        stroke: "none",
                        fill: (fullConfig.theme?.colors as any).deepblue["50"],
                      }}
                      dx={10}
                      pointerLength={0}
                    />
                  }
                  colorScale={[
                    (fullConfig.theme?.colors as any).lightning["500"],
                    (fullConfig.theme?.colors as any).deepblue["800"],
                  ]}
                  data={[
                    {
                      x: `Implementiert (${(
                        (props.data[key] / props.totalCount) *
                        100
                      ).toFixed(1)}%)`,
                      y: props.data[key],
                    },
                    {
                      x: `Fehlerhaft (${(
                        ((props.totalCount - props.data[key]) /
                          props.totalCount) *
                        100
                      ).toFixed(1)}%)`,
                      y: props.totalCount - props.data[key],
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        </div>
      </DashboardPage>
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, db]) => {
    // get the query params.
    const page = +(context.query["page"] ?? 0);
    const search = context.query["search"] as string | undefined;

    return {
      props: {
        ...(await getFailedSuccessPercentage(currentUser.networks, db.Report)),
      },
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
