import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import DashboardPage from "../../components/DashboardPage";
import DomainOverviewForm from "../../components/DomainOverviewForm";
import DomainTableHeader from "../../components/DomainTableHeader";
import DomainTableItem from "../../components/DomainTableItem";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Pagination from "../../components/Pagination";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUser } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import useLoading from "../../hooks/useLoading";
import { InspectionType } from "../../inspection/scans";
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
          <p className="mb-10 w-2/3 text-slate-300">
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
            <div className="w-full">
              <DomainTableHeader
                selectedFQDNs={selectedFQDNs}
                domains={domains}
                setSelection={setSelection}
                sort={sort}
                handleSort={handleSort}
              />
              <div>
                {domains.map((domain, i) => {
                  return (
                    <DomainTableItem
                      domain={domain}
                      key={domain.fqdn}
                      i={i}
                      selection={selection}
                      deleteFQDN={deleteFQDN}
                      scanFQDN={scanFQDN}
                      scanRequest={scanRequest}
                      totalElements={domains.length}
                      select={(fqdn) => {
                        setSelection({
                          ...selection,
                          [fqdn]: !Boolean(selection[fqdn]),
                        });
                      }}
                    />
                  );
                })}
              </div>
            </div>
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
