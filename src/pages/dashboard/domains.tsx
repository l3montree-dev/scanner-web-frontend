import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCaretDown,
  faCaretUp,
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import DashboardPage from "../../components/DashboardPage";
import DomainOverviewForm from "../../components/DomainOverviewForm";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Pagination from "../../components/Pagination";
import ResultIcon from "../../components/ResultIcon";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
import { WithId } from "../../db/models";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUser } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import { withTokenServerSideProps } from "../../decorators/withToken";
import useLoading from "../../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../../inspection/scans";
import { clientHttpClient } from "../../services/clientHttpClient";
import { domainService } from "../../services/domainService";

import { IDomain, IReport, PaginateResult } from "../../types";
import { classNames, isAdmin } from "../../utils/common";

interface Props {
  domains: PaginateResult<WithId<IDomain> & { report?: WithId<IReport> }>;
}

const didPass2Number = (didPass: boolean | null | undefined) => {
  if (didPass === null || didPass === undefined) {
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

const sortDomains = (
  instructions: {
    key: "fqdn" | "ipV4Address" | keyof IReport["result"];
    direction: 1 | -1;
  },
  domains: Array<WithId<IDomain> & { report?: WithId<IReport> }>
) => {
  return domains.sort((a, b) => {
    if (instructions.key === "fqdn") {
      return a.fqdn.localeCompare(b.fqdn) * instructions.direction;
    }
    if (instructions.key === "ipV4Address") {
      return (
        a.ipV4Address.localeCompare(b.ipV4Address) * instructions.direction
      );
    }
    return (
      (didPass2Number(a.report?.result[instructions.key]?.didPass) -
        didPass2Number(b.report?.result[instructions.key]?.didPass)) *
      instructions.direction
    );
  });
};

const Dashboard: FunctionComponent<Props> = (props) => {
  const [domains, setDomains] = useState<
    Array<WithId<IDomain> & { report?: WithId<IReport> }>
  >(props.domains.data);

  const scanRequest = useLoading();
  const router = useRouter();

  const handleSort = (key: typeof sort["key"]) => {
    // check if we should reverse the order.
    const instructions = { key, direction: 1 as 1 | -1 };
    if (key === sort.key) {
      instructions.direction = (sort.direction * -1) as 1 | -1;
    }
    patchQuery({
      sort: instructions.key,
      sortDirection: instructions.direction.toString(),
    });
  };

  const getIcon = (key: typeof sort["key"]) => {
    if (sort.key === key) {
      return sort.direction === 1 ? faCaretUp : faCaretDown;
    }
    return faCaretUp;
  };

  const patchQuery = (query: Record<string, string>) =>
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...query,
      },
    });

  useEffect(() => {
    setDomains(sortDomains(sort, props.domains.data));
  }, [props.domains]);

  const scanFQDN = async (fqdn: string) => {
    scanRequest.loading(fqdn);

    const response = await clientHttpClient(
      `/api/scan?site=${fqdn}&refresh=true`,
      crypto.randomUUID()
    );

    if (response.ok) {
      const data: WithId<IReport> = await response.json();
      // inject it into the domains
      setDomains((prev) => {
        const index = prev.findIndex((d) => d.fqdn === fqdn);
        if (index === -1) {
          return prev;
        }
        const newDomains = [...prev];
        newDomains[index] = {
          ...newDomains[index],
          lastScan: data.lastScan,
          report: {
            ...data,
          },
        };
        return newDomains;
      });
      scanRequest.success();
    } else {
      const data: { error: string; fqdn: string; ipAddress: string } =
        await response.json();
      setDomains((prev) => {
        const index = prev.findIndex(
          (d) => d.fqdn === data.fqdn && d.ipV4Address === data.ipAddress
        );
        if (index === -1) {
          return prev;
        }
        const newDomains = [...prev];
        newDomains[index] = {
          ...newDomains[index],
          lastScan: Date.now(),
          errorCount: (newDomains[index].errorCount || 0) + 1,
        };
        return newDomains;
      });
      scanRequest.error("Fehler beim Scannen der Domain.", fqdn);
    }
  };

  const handleSearch = async (value: string) => {
    patchQuery({ search: value });
  };

  const handleAddRecord = async (domain: string) => {
    const res = await clientHttpClient(`/api/domains`, crypto.randomUUID(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
    });

    if (!res.ok) {
      throw res;
    }
  };

  const handleFileFormSubmit = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await clientHttpClient("/api/domains", crypto.randomUUID(), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw res;
    }
  };

  const sort = {
    key: router.query.sort as "fqdn" | "ipV4Address" | keyof IReport["result"],
    direction: parseInt(router.query.sortDirection as string) as 1 | -1,
  };

  return (
    <DashboardPage title="Domainübersicht">
      <SideNavigation />
      <div className="flex-1">
        <div className="text-white">
          <h1 className="text-4xl mb-5 font-bold">Domainübersicht</h1>
          <p className="mb-10 w-1/2 text-slate-300">
            Auf der Domainübersicht finden Sie alle Testergebnisse für Ihre
            Domains auf einen Blick. Hier können Sie schnell und einfach
            vergleichen, wie gut die verschiedenen Domains in Bezug auf die
            verschiedenen ausgeführten Sicherheitstest abschneiden.
            <br />
            <br />
            Im Augenblick haben Sie Zugriff auf <b>
              {props.domains.total}
            </b>{" "}
            Domains
          </p>
          <div className="w-full border-deepblue-200 border bg-deepblue-500">
            <div className="p-5">
              <div className="text-black">
                <DomainOverviewForm
                  onSearch={handleSearch}
                  onNewDomain={handleAddRecord}
                  onFileFormSubmit={handleFileFormSubmit}
                />
              </div>
            </div>
            <table className="w-full">
              <thead className="">
                <tr className="bg-deepblue-100 text-sm border-b border-b-deepblue-500 text-left">
                  <th className="p-2">
                    <div>
                      <span>Domain</span>
                      <SortButton
                        sortKey="fqdn"
                        onSort={handleSort}
                        active={sort.key === "fqdn"}
                        getIcon={() => getIcon("fqdn")}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span>IP Adresse</span>
                      <SortButton
                        sortKey="ipV4Address"
                        onSort={handleSort}
                        active={sort.key === "ipV4Address"}
                        getIcon={() => getIcon("ipV4Address")}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span>IPv6 Adressen</span>
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
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
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span>TLS 1.3</span>
                      <SortButton
                        sortKey={TLSInspectionType.TLSv1_3}
                        onSort={handleSort}
                        active={sort.key === TLSInspectionType.TLSv1_3}
                        getIcon={() => getIcon(TLSInspectionType.TLSv1_3)}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span>
                        Veraltete TLS/ SSL
                        <br /> Protokolle deaktiviert
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
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span className="whitespace-nowrap">HSTS</span>
                      <SortButton
                        sortKey={HeaderInspectionType.HSTS}
                        onSort={handleSort}
                        active={sort.key === HeaderInspectionType.HSTS}
                        getIcon={() => getIcon(HeaderInspectionType.HSTS)}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span>DNSSEC</span>
                      <SortButton
                        sortKey={DomainInspectionType.DNSSec}
                        onSort={handleSort}
                        active={sort.key === DomainInspectionType.DNSSec}
                        getIcon={() => getIcon(DomainInspectionType.DNSSec)}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span className="whitespace-nowrap">RPKI</span>
                      <SortButton
                        sortKey={NetworkInspectionType.RPKI}
                        onSort={handleSort}
                        active={sort.key === NetworkInspectionType.RPKI}
                        getIcon={() => getIcon(NetworkInspectionType.RPKI)}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <span>Aktionen</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  return (
                    <tr
                      className={classNames(
                        "border-b border-b-deepblue-200 transition-all",
                        domain.errorCount !== null && domain.errorCount >= 5
                          ? "line-through"
                          : ""
                      )}
                      key={domain.id}
                    >
                      <td className="p-2">
                        {domain.fqdn}
                        <div className="inline ml-2">
                          <Tooltip
                            tooltip={
                              domain.lastScan !== null
                                ? `Letzter Scan: ${new Date(
                                    domain.lastScan
                                  ).toLocaleString()}${
                                    domain.errorCount !== null &&
                                    domain.errorCount > 0
                                      ? ` (${domain.errorCount} Fehler)`
                                      : ""
                                  }${
                                    domain.errorCount !== null &&
                                    domain.errorCount >= 5
                                      ? " Domain wird nicht mehr automatisiert gescanned, da 5 Fehler überschritten wurden"
                                      : ""
                                  }`
                                : "Noch nicht gescannt"
                            }
                          >
                            <FontAwesomeIcon
                              className="opacity-50"
                              icon={faQuestionCircle}
                            />
                          </Tooltip>
                        </div>
                      </td>
                      <td className="p-2">{domain.ipV4Address}</td>
                      <td className="p-2">
                        {domain.report?.result.IPv6?.actualValue.addresses.join(
                          ", "
                        )}
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={
                            domain.report?.result.ResponsibleDisclosure?.didPass
                          }
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report?.result.TLSv1_3?.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={
                            domain.report?.result.TLSv1_1_Deactivated?.didPass
                          }
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report?.result.HSTS?.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report?.result.DNSSec?.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.report?.result.RPKI?.didPass}
                        />
                      </td>
                      <td className="text-right p-2">
                        <Menu
                          Button={
                            <div className="p-2 h-8 w-8 flex flex-row items-center justify-center">
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                            </div>
                          }
                          Menu={
                            <MenuList>
                              <MenuItem
                                loading={
                                  scanRequest.key === domain.fqdn &&
                                  scanRequest.isLoading
                                }
                                onClick={() => scanFQDN(domain.fqdn)}
                              >
                                <div>
                                  <div>Erneut scannen</div>
                                  {scanRequest.key === domain.fqdn && (
                                    <span className="block text-red-500 text-sm">
                                      {scanRequest.errorMessage}
                                    </span>
                                  )}
                                </div>
                              </MenuItem>
                            </MenuList>
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-row justify-center">
            <Pagination
              onPageChange={(page) => {
                patchQuery({ page: page.toString() });
              }}
              {...props.domains}
            />
          </div>
        </div>
      </div>
    </DashboardPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, token, db]) => {
    // get the query params.
    const page = +(context.query["page"] ?? 0);
    const search = context.query["search"] as string | undefined;

    const domains =
      await domainService.getDomainsOfNetworksWithLatestTestResult(
        isAdmin(token),
        currentUser.networks,
        {
          pageSize: 50,
          page,
          search,
          sort: context.query["sort"] as string | undefined,
          sortDirection: context.query["sortDirection"] as string | undefined,
        },
        db.Domain
      );

    return {
      props: {
        domains,
      },
    };
  },
  withCurrentUser,
  withTokenServerSideProps,
  withDB
);

export default Dashboard;
