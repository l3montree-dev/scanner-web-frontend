import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCaretDown,
  faCaretUp,
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FormEvent, FunctionComponent, useEffect, useState } from "react";
import Button from "../../components/Button";
import DashboardPage from "../../components/DashboardPage";
import FormInput from "../../components/FormInput";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Meta from "../../components/Meta";
import Pagination from "../../components/Pagination";
import ResultIcon from "../../components/ResultIcon";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
import { WithId } from "../../db/models";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUser } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import useLoading from "../../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../../inspection/scans";
import { clientHttpClient } from "../../services/clientHttpClient";
import { getDomainsOfNetworksWithLatestTestResult } from "../../services/domainService";
import { IDomain, IReport, PaginateResult } from "../../types";
import { classNames } from "../../utils/common";

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

const DomainOverviewForm: FunctionComponent<{
  onSearch: (search: string) => Promise<void>;
  onNewDomain: (domain: string) => Promise<void>;
}> = ({ onSearch, onNewDomain }) => {
  const [search, setSearch] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const searchRequest = useLoading();
  const createRequest = useLoading();

  const [addDomainIsOpen, setAddDomainIsOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    searchRequest.loading();
    onSearch(search)
      .catch(() => {
        searchRequest.error("Leider ist ein Fehler bei der Suche aufgetreten.");
      })
      .then(() => searchRequest.success());
  };

  const handleAddRecord = (e: FormEvent) => {
    e.preventDefault();
    createRequest.loading();
    onNewDomain(newDomain)
      .catch((err) => {
        createRequest.error("Leider ist ein Fehler aufgetreten.");
      })
      .then(() => {
        setNewDomain("");
        createRequest.success();
      });
  };
  return (
    <div>
      <div className="flex flex-row items-end">
        <form
          className="flex flex-1 flex-row items-end"
          onSubmit={handleSearch}
        >
          <div className="flex-1">
            <FormInput
              onChange={setSearch}
              label="Suche nach Domains"
              value={search}
              placeholder="example.com"
            />
          </div>
          <div>
            <Button
              spinnerSize={32}
              className="bg-deepblue-100 border border-deepblue-100 ml-5 text-white p-2"
              type="submit"
              spinnerColor="white"
              loading={searchRequest.isLoading}
            >
              Suchen
            </Button>
          </div>
        </form>
        <div>
          <Button
            className={classNames(
              "border border-deepblue-100 ml-5 text-white p-2",
              addDomainIsOpen && "bg-deepblue-100"
            )}
            type="submit"
            loading={false}
            onClick={() => setAddDomainIsOpen((prev) => !prev)}
          >
            Eintrag hinzufügen
          </Button>
        </div>
      </div>
      {!searchRequest.errored && (
        <span className="text-red-500 mt-2">{searchRequest.errorMessage}</span>
      )}
      {
        // Add domain form
        addDomainIsOpen && (
          <form
            onSubmit={handleAddRecord}
            className="flex flex-row border-t pt-2 border-t-deepblue-100 items-end mt-5"
          >
            <div className="flex-1">
              <FormInput
                onChange={setNewDomain}
                label="Domain hinzufügen"
                value={newDomain}
                placeholder="example.com"
              />
            </div>
            <div className="flex flex-row items-end">
              <Button
                spinnerSize={32}
                spinnerColor="white"
                className="bg-deepblue-100 ml-5 text-white border border-deepblue-100 p-2"
                type="submit"
                loading={createRequest.isLoading}
              >
                Hinzufügen
              </Button>
              <Button
                className="border border-deepblue-100 ml-5 text-white p-2"
                type="submit"
                loading={createRequest.isLoading}
                onClick={() => setAddDomainIsOpen(false)}
              >
                Schliessen
              </Button>
            </div>
          </form>
        )
      }
      {createRequest.errored && (
        <span className="text-red-500 mt-2">{createRequest.errorMessage}</span>
      )}
    </div>
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
      (didPass2Number(a.report?.result[instructions.key].didPass) -
        didPass2Number(b.report?.result[instructions.key].didPass)) *
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
    setDomains((prev) => sortDomains(instructions, prev));
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
    try {
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
      } else {
        scanRequest.error("Fehler beim Scannen der Domain.", fqdn);
      }
      scanRequest.success();
    } catch (error) {
      scanRequest.error("Fehler beim Scannen der Domain.", fqdn);
    }
  };

  const handleSearch = async (value: string) => {
    patchQuery({ search: value });
  };

  const handleAddRecord = async (domain: string) => {
    await clientHttpClient(`/api/domains`, crypto.randomUUID(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
    });
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
            <div className="border-2 w-full border-deepblue-200">
              <div className="p-5">
                <div className="text-black">
                  <DomainOverviewForm
                    onSearch={handleSearch}
                    onNewDomain={handleAddRecord}
                  />
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-deepblue-300 text-sm border-b border-b-deepblue-500 text-left">
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
                        className="border-b border-b-deepblue-300 transition-all"
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
                          <ResultIcon
                            didPass={
                              domain.report?.result.ResponsibleDisclosure
                                .didPass
                            }
                          />
                        </td>
                        <td className="p-2">
                          <ResultIcon
                            didPass={domain.report?.result.TLSv1_3.didPass}
                          />
                        </td>
                        <td className="p-2">
                          <ResultIcon
                            didPass={
                              domain.report?.result.TLSv1_1_Deactivated.didPass
                            }
                          />
                        </td>
                        <td className="p-2">
                          <ResultIcon
                            didPass={domain.report?.result.HSTS.didPass}
                          />
                        </td>
                        <td className="p-2">
                          <ResultIcon
                            didPass={domain.report?.result.DNSSec.didPass}
                          />
                        </td>
                        <td className="p-2">
                          <ResultIcon
                            didPass={domain.report?.result.RPKI.didPass}
                          />
                        </td>
                        <td className="text-center">
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
                                  Erneut scannen
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
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, db]) => {
    // get the query params.
    const page = +(context.query["page"] ?? 0);
    const search = context.query["search"] as string | undefined;

    const domains = await getDomainsOfNetworksWithLatestTestResult(
      currentUser.networks,
      { pageSize: 50, page, search },
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
