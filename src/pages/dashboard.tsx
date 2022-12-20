import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import DashboardPage from "../components/DashboardPage";
import Meta from "../components/Meta";
import ResultIcon from "../components/ResultIcon";
import SideNavigation from "../components/SideNavigation";
import { WithId } from "../db/models";
import { decorateServerSideProps } from "../decorators/decorateServerSideProps";

import { withCurrentUser } from "../decorators/withCurrentUser";
import { withDB } from "../decorators/withDB";
import {
  DomainInspectionType,
  HeaderInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { getDomainsOfNetworkWithLatestTestResult } from "../services/domainService";
import { IDomain, IReport } from "../types";
import { classNames } from "../utils/common";

interface Props {
  domains: Array<WithId<IDomain> & { report: WithId<IReport> }>;
}

const didPass2Number = (didPass: boolean | null) => {
  if (didPass === null) {
    return 0;
  }
  if (didPass === true) {
    return 1;
  }
  return -1;
};

const SortButton: FunctionComponent<{
  sortKey: "fqdn" | "ipV4Address" | keyof IReport["result"];
  onSort: (key: "fqdn" | "ipV4Address" | keyof IReport["result"]) => void;
  active: boolean;
  getIcon: () => IconProp;
}> = ({ sortKey: key, onSort, active, getIcon }) => {
  return (
    <button
      onClick={() => {
        onSort(key);
      }}
      className={classNames(
        "hover:bg-deepblue-200 ml-2 transition-all w-8 h-8 hover:text-white",
        !active && "text-gray-500",
        active && "text-white"
      )}
    >
      <FontAwesomeIcon icon={getIcon()} />
    </button>
  );
};

const Dashboard: FunctionComponent<Props> = (props) => {
  const [domains, setDomains] = useState<
    Array<WithId<IDomain> & { report: WithId<IReport> }>
  >(props.domains);

  const [sort, setSort] = useState<{
    key: "fqdn" | "ipV4Address" | keyof IReport["result"];
    direction: 1 | -1;
  }>({ key: "fqdn", direction: 1 });

  const handleSort = (key: typeof sort["key"]) => {
    // check if we should reverse the order.
    const instructions = { key, direction: 1 as 1 | -1 };
    if (key === sort.key) {
      instructions.direction = (sort.direction * -1) as 1 | -1;
    }
    setSort(instructions);
    setDomains(
      domains.sort((a, b) => {
        if (instructions.key === "fqdn") {
          return a.fqdn.localeCompare(b.fqdn) * instructions.direction;
        }
        if (instructions.key === "ipV4Address") {
          return (
            a.ipV4Address.localeCompare(b.ipV4Address) * instructions.direction
          );
        }
        return (
          (didPass2Number(a.report.result[instructions.key].didPass) -
            didPass2Number(b.report.result[instructions.key].didPass)) *
          instructions.direction
        );
      })
    );
  };

  const getIcon = (key: typeof sort["key"]) => {
    if (sort.key === key) {
      return sort.direction === 1 ? faCaretUp : faCaretDown;
    }
    return faCaretUp;
  };

  return (
    <>
      <Meta title="Dashboard" />
      <DashboardPage>
        <SideNavigation />
        <div className="flex-1">
          <div className="text-white">
            <h1 className="text-4xl mb-5 font-bold">Domainübersicht</h1>
            <p className="mb-10 w-1/2">
              Auf der Domainübersicht finden Sie alle Testergebnisse für Ihre
              Domains auf einen Blick. Hier können Sie schnell und einfach
              vergleichen, wie gut die verschiedenen Domains in Bezug auf die
              verschiedenen ausgeführten Sicherheitstest abschneiden.
            </p>
            <table className="border-2 w-full border-deepblue-200">
              <thead>
                <tr className="bg-deepblue-300 border-b border-b-deepblue-500 text-left">
                  <th className="p-2">
                    <span>Domain</span>
                    <SortButton
                      sortKey="fqdn"
                      onSort={handleSort}
                      active={sort.key === "fqdn"}
                      getIcon={() => getIcon("fqdn")}
                    />
                  </th>
                  <th className="p-2">
                    <span>IP Adresse</span>
                    <SortButton
                      sortKey="ipV4Address"
                      onSort={handleSort}
                      active={sort.key === "ipV4Address"}
                      getIcon={() => getIcon("ipV4Address")}
                    />
                  </th>
                  <th className="p-2">
                    <span>Responsible Disclosure</span>
                    <SortButton
                      sortKey={
                        OrganizationalInspectionType.ResponsibleDisclosure
                      }
                      onSort={handleSort}
                      active={
                        sort.key ===
                        OrganizationalInspectionType.ResponsibleDisclosure
                      }
                      getIcon={() =>
                        getIcon(
                          OrganizationalInspectionType.ResponsibleDisclosure
                        )
                      }
                    />
                  </th>
                  <th className="p-2">
                    <span>TLS 1.3</span>
                    <SortButton
                      sortKey={TLSInspectionType.TLSv1_3}
                      onSort={handleSort}
                      active={sort.key === TLSInspectionType.TLSv1_3}
                      getIcon={() => getIcon(TLSInspectionType.TLSv1_3)}
                    />
                  </th>
                  <th className="p-2">
                    <span>
                      Deaktivierung von veralteten TLS/ SSL Protokollen
                    </span>
                    <SortButton
                      sortKey={TLSInspectionType.TLSv1_1_Deactivated}
                      onSort={handleSort}
                      active={
                        sort.key === TLSInspectionType.TLSv1_1_Deactivated
                      }
                      getIcon={() =>
                        getIcon(TLSInspectionType.TLSv1_1_Deactivated)
                      }
                    />
                  </th>
                  <th className="p-2">
                    <span>HSTS</span>
                    <SortButton
                      sortKey={HeaderInspectionType.HSTS}
                      onSort={handleSort}
                      active={sort.key === HeaderInspectionType.HSTS}
                      getIcon={() => getIcon(HeaderInspectionType.HSTS)}
                    />
                  </th>
                  <th className="p-2">
                    <span>DNSSEC</span>
                    <SortButton
                      sortKey={DomainInspectionType.DNSSec}
                      onSort={handleSort}
                      active={sort.key === DomainInspectionType.DNSSec}
                      getIcon={() => getIcon(DomainInspectionType.DNSSec)}
                    />
                  </th>
                  <th className="p-2">
                    <span>RPKI</span>
                    <SortButton
                      sortKey={NetworkInspectionType.RPKI}
                      onSort={handleSort}
                      active={sort.key === NetworkInspectionType.RPKI}
                      getIcon={() => getIcon(NetworkInspectionType.RPKI)}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  return (
                    <tr
                      className="border-b  border-b-deepblue-300 hover:bg-deepblue-300 cursor-pointer transition-all"
                      key={domain.id}
                    >
                      <td className="p-2">{domain.fqdn}</td>
                      <td className="p-2">{domain.ipV4Address}</td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={
                            domain.report.result.ResponsibleDisclosure.didPass
                          }
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report.result.TLSv1_3.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={
                            domain.report.result.TLSv1_1_Deactivated.didPass
                          }
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report.result.HSTS.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report.result.DNSSec.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report.result.RPKI.didPass}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardPage>
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, db]) => {
    // fetch the user object.;

    const domains = await getDomainsOfNetworkWithLatestTestResult(
      currentUser.networks[0],
      { pageSize: 50, page: 0 },
      db.Domain
    );

    return {
      props: {
        domains,
      },
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
