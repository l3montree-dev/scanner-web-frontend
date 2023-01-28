import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faCaretDown,
  faCaretUp,
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import DashboardPage from "../../components/DashboardPage";
import DomainOverviewForm from "../../components/DomainOverviewForm";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Pagination from "../../components/Pagination";
import ResultIcon from "../../components/ResultIcon";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUser } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import useLoading from "../../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../../inspection/scans";
import { clientHttpClient } from "../../services/clientHttpClient";
import { domainService } from "../../services/domainService";

import {
  DetailedDomain,
  DomainType,
  IScanSuccessResponse,
  PaginateResult,
} from "../../types";
import { classNames } from "../../utils/common";
import { DTO } from "../../utils/server";

interface Props {
  domains: PaginateResult<DTO<DetailedDomain>>;
}

const SortButton: FunctionComponent<{
  sortKey: "fqdn" | keyof IScanSuccessResponse["result"];
  onSort: (key: "fqdn" | keyof IScanSuccessResponse["result"]) => void;
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

const translateDomainType = (type: DomainType) => {
  switch (type) {
    case DomainType.reachable:
      return "Erreichbare Domains";
    case DomainType.unreachable:
      return "Nicht erreichbare Domains";
    case DomainType.all:
      return "Alle Domains";
  }
};

const Dashboard: FunctionComponent<Props> = (props) => {
  const [domains, setDomains] = useState<Array<DTO<DetailedDomain>>>(
    props.domains.data
  );

  const [selection, setSelection] = useState<{ [fqdn: string]: boolean }>({});
  const scanAllLoading = useLoading();

  const scanRequest = useLoading();
  const router = useRouter();

  const viewedDomainType =
    (router.query.domainType as DomainType | undefined) ?? DomainType.all;
  const handleSort = (key: InspectionType | "fqdn") => {
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

  const getIcon = (key: InspectionType | "fqdn") => {
    if (sort.key === key) {
      return sort.direction === 1 ? faCaretUp : faCaretDown;
    }
    return faCaretUp;
  };

  const patchQuery = (query: Record<string, string>) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...query,
      },
    });
    setSelection({});
  };

  useEffect(() => {
    setDomains(props.domains.data);
  }, [props.domains]);

  const deleteFQDN = async (fqdn: string) => {
    const response = await clientHttpClient(
      `/api/domains`,
      crypto.randomUUID(),
      {
        method: "DELETE",
        body: JSON.stringify({
          domains: [fqdn],
        }),
      }
    );
    if (response.ok) {
      setDomains((prev) => prev.filter((d) => d.fqdn !== fqdn));
    }
  };

  const selectedFQDNs = useMemo(
    () =>
      Object.entries(selection)
        .filter(([key, value]) => value)
        .map(([key]) => key),
    [selection]
  );

  const deleteSelection = async () => {
    const response = await clientHttpClient(
      `/api/domains`,
      crypto.randomUUID(),
      {
        method: "DELETE",
        body: JSON.stringify({
          domains: selectedFQDNs,
        }),
      }
    );
    if (response.ok) {
      setDomains((prev) => prev.filter((d) => !selectedFQDNs.includes(d.fqdn)));
    }
  };

  const scanFQDN = async (fqdn: string) => {
    scanRequest.loading(fqdn);

    const response = await clientHttpClient(
      `/api/scan?site=${fqdn}&refresh=true`,
      crypto.randomUUID()
    );

    if (response.ok) {
      const data: DTO<DetailedDomain> = await response.json();
      // inject it into the domains
      setDomains((prev) => {
        return prev.map((d) => {
          if (d.fqdn === data.fqdn) {
            return data;
          }
          return d;
        });
      });
      scanRequest.success();
    } else {
      setDomains((prev) => {
        const index = prev.findIndex((d) => d.fqdn === fqdn);
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
    patchQuery({ search: value, page: "0" });
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
    const detailedDomain = await res.json();
    setDomains((prev) => [...prev, detailedDomain]);
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
    key: router.query.sort as "fqdn" | keyof IScanSuccessResponse["result"],
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
          </p>
          <div className="w-full border-deepblue-50 border bg-deepblue-500">
            <div className="p-5">
              <div className="text-black">
                <DomainOverviewForm
                  onSearch={handleSearch}
                  onNewDomain={handleAddRecord}
                  onFileFormSubmit={handleFileFormSubmit}
                />
              </div>
            </div>
            <div className="border-t flex flex-row border-deepblue-50 border-b">
              <div
                className={classNames(
                  "flex flex-row justify-start",
                  selectedFQDNs.length === 0
                    ? "opacity-50 pointer-events-none"
                    : ""
                )}
              >
                <Menu
                  Button={
                    <div className="p-2 bg-deepblue-100 border border-deepblue-100 m-2 flex flex-row items-center justify-center">
                      Gruppenaktionen ({selectedFQDNs.length})
                      <FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                    </div>
                  }
                  Menu={
                    <MenuList>
                      <MenuItem
                        loading={scanAllLoading.isLoading}
                        onClick={async () => {
                          scanAllLoading.loading();
                          try {
                            await Promise.all(
                              selectedFQDNs.map((d) => scanFQDN(d))
                            );
                          } finally {
                            scanAllLoading.success();
                          }
                        }}
                      >
                        <div>
                          <div>Erneut scannen</div>
                        </div>
                      </MenuItem>
                      <MenuItem onClick={deleteSelection}>
                        <div>Löschen</div>
                      </MenuItem>
                    </MenuList>
                  }
                />
              </div>
              <Menu
                Button={
                  <div className="p-2 bg-deepblue-100 border border-deepblue-100 my-2 flex flex-row items-center justify-center">
                    Zeige: {translateDomainType(viewedDomainType)} (
                    {props.domains.total})
                    <FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                  </div>
                }
                Menu={
                  <MenuList>
                    {Object.values(DomainType).map((type) => (
                      <MenuItem
                        key={type}
                        selected={type === viewedDomainType}
                        loading={scanAllLoading.isLoading}
                        onClick={async () => {
                          patchQuery({ domainType: type, page: "0" });
                        }}
                      >
                        <div>{translateDomainType(type)}</div>
                      </MenuItem>
                    ))}
                  </MenuList>
                }
              />
            </div>
            <table className="w-full">
              <thead className="">
                <tr className="bg-deepblue-200 text-sm border-b border-b-deepblue-50 text-left">
                  <th className="p-2 pr-0">
                    <Checkbox
                      checked={
                        selectedFQDNs.length > 0 &&
                        selectedFQDNs.length === props.domains.data.length
                      }
                      onChange={() => {
                        console.log("change");
                        setSelection((prev) => {
                          return props.domains.data.reduce((acc, domain) => {
                            acc[domain.fqdn] = !Boolean(prev[domain.fqdn]);
                            return acc;
                          }, {} as Record<string, boolean>);
                        });
                      }}
                    />
                  </th>
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
                {domains.map((domain, i) => {
                  return (
                    <tr
                      onClick={() => {
                        setSelection((prev) => {
                          if (prev[domain.fqdn] === undefined) {
                            prev[domain.fqdn] = true;
                            return { ...prev };
                          }
                          return {
                            ...prev,
                            [domain.fqdn]: !prev[domain.fqdn],
                          };
                        });
                      }}
                      className={classNames(
                        "cursor-pointer",
                        i !== domains.length - 1 && "border-b",
                        "border-b-deepblue-300 transition-all",
                        domain.errorCount !== null && domain.errorCount >= 5
                          ? "line-through"
                          : "",
                        selection[domain.fqdn]
                          ? "bg-deepblue-200"
                          : i % 2 === 0
                          ? "bg-deepblue-400"
                          : "bg-deepblue-500"
                      )}
                      key={domain.fqdn}
                    >
                      <td className="p-2 pr-0">
                        <div className="flex flex-row items-center">
                          <Checkbox
                            onChange={() => {
                              setSelection((prev) => {
                                if (prev[domain.fqdn] === undefined) {
                                  prev[domain.fqdn] = true;
                                  return { ...prev };
                                }
                                return {
                                  ...prev,
                                  [domain.fqdn]: !prev[domain.fqdn],
                                };
                              });
                            }}
                            checked={Boolean(selection[domain.fqdn])}
                          />
                        </div>
                      </td>
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
                      <td className="p-2">
                        <ResultIcon
                          didPass={
                            domain.details?.ResponsibleDisclosure?.didPass
                          }
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.details?.TLSv1_3?.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon
                          didPass={domain.details?.TLSv1_1_Deactivated?.didPass}
                        />
                      </td>
                      <td className="p-2">
                        <ResultIcon didPass={domain.details?.HSTS?.didPass} />
                      </td>
                      <td className="p-2">
                        <ResultIcon didPass={domain.details?.DNSSec?.didPass} />
                      </td>
                      <td className="p-2">
                        <ResultIcon didPass={domain.details?.RPKI?.didPass} />
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
                              <MenuItem onClick={() => deleteFQDN(domain.fqdn)}>
                                <div>Löschen</div>
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
  async (context, [currentUser, prisma]) => {
    // get the query params.
    const page = +(context.query["page"] ?? 0);
    const search = context.query["search"] as string | undefined;

    const domains =
      await domainService.getDomainsOfNetworksWithLatestTestResult(
        currentUser,
        {
          pageSize: 50,
          page,
          search,
          type:
            (context.query["domainType"] as DomainType | undefined) ||
            DomainType.all,
          sort: context.query["sort"] as string | undefined,
          sortDirection: context.query["sortDirection"] as string | undefined,
        },
        prisma
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
