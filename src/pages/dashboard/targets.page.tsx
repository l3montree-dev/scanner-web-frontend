import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import Checkbox from "../../components/Checkbox";
import DashboardPage from "../../components/DashboardPage";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Pagination from "../../components/Pagination";
import SideNavigation from "../../components/SideNavigation";
import TargetOverviewForm from "../../components/TargetOverviewForm";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserServerSideProps } from "../../decorators/withCurrentUser";
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
import { targetService } from "../../services/targetService";

import { Collection, Target, User } from "@prisma/client";
import { SortButton } from "../../components/SortButton";
import TargetTableItem from "../../components/TargetTableItem";
import { collectionService } from "../../services/collectionService";
import {
  DetailedTarget,
  IScanSuccessResponse,
  PaginateResult,
  TargetType,
} from "../../types";
import { classNames, normalizeToMap } from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";

interface Props {
  targets: PaginateResult<DTO<DetailedTarget> & { collections: number[] }>; // should include array of collection ids the target is in
  // normalized collections map for fast access
  collections: { [collectionId: string]: DTO<Collection> };
  keycloakIssuer: string;
}

const translateDomainType = (type: TargetType) => {
  switch (type) {
    case TargetType.reachable:
      return "Erreichbare Domains";
    case TargetType.unreachable:
      return "Nicht erreichbare Domains";
    case TargetType.all:
      return "Alle Domains";
  }
};

const Targets: FunctionComponent<Props> = (props) => {
  const [targets, setTargets] = useState<
    Array<DTO<DetailedTarget> & { collections: number[] }>
  >(props.targets.data);

  const [selection, setSelection] = useState<{ [uri: string]: boolean }>({});
  const scanAllLoading = useLoading();

  const scanRequest = useLoading();
  const router = useRouter();

  const viewedDomainType =
    (router.query.domainType as TargetType | undefined) ?? TargetType.all;
  const handleSort = (key: InspectionType | "uri") => {
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

  const getIcon = (key: InspectionType | "uri") => {
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
    setTargets(props.targets.data);
  }, [props.targets]);

  const deleteTarget = async (uri: string) => {
    const response = await clientHttpClient(
      `/api/targets`,
      crypto.randomUUID(),
      {
        method: "DELETE",
        body: JSON.stringify({
          targets: [uri],
        }),
      }
    );
    if (response.ok) {
      setTargets((prev) => prev.filter((d) => d.uri !== uri));
    }
  };

  const selectedTargets = useMemo(
    () =>
      Object.entries(selection)
        .filter(([key, value]) => value)
        .map(([key]) => key),
    [selection]
  );

  const deleteSelection = async () => {
    const response = await clientHttpClient(
      `/api/targets`,
      crypto.randomUUID(),
      {
        method: "DELETE",
        body: JSON.stringify({
          targets: selectedTargets,
        }),
      }
    );
    if (response.ok) {
      setTargets((prev) =>
        prev.filter((d) => !selectedTargets.includes(d.uri))
      );
      // remove them from the selection
      setSelection((prev) => {
        const newSelection = { ...prev };
        selectedTargets.forEach((uri) => {
          newSelection[uri] = false;
        });
        return newSelection;
      });
    }
  };

  const scanTarget = async (uri: string) => {
    scanRequest.loading(uri);

    const response = await clientHttpClient(
      `/api/scan?site=${uri}&refresh=true`,
      crypto.randomUUID()
    );

    if (response.ok) {
      const data: DTO<DetailedTarget & { collections: number[] }> =
        await response.json();
      // inject it into the domains
      setTargets((prev) => {
        return prev.map((d) => {
          if (d.uri === data.uri) {
            return data;
          }
          return d;
        });
      });
      scanRequest.success();
    } else {
      setTargets((prev) => {
        const index = prev.findIndex((d) => d.uri === uri);
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
      scanRequest.error("Fehler beim Scannen der Domain.", uri);
    }
  };

  const handleSearch = async (value: string) => {
    patchQuery({ search: value, page: "0" });
  };

  const handleAddRecord = async (target: string) => {
    const res = await clientHttpClient(`/api/targets`, crypto.randomUUID(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target }),
    });

    if (!res.ok) {
      throw res;
    }
    const detailedDomain = await res.json();
    setTargets((prev) => [...prev, detailedDomain]);
  };

  const handleAddToCollection = async (
    target: DTO<Target>,
    collectionId: number
  ) => {
    const res = await clientHttpClient(
      `/api/collections/${collectionId}/targets`,
      crypto.randomUUID(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([target]),
      }
    );

    if (!res.ok) {
      throw res;
    }

    // add the collection to the target
    setTargets((prev) => {
      const index = prev.findIndex((d) => d.uri === target.uri);
      if (index === -1) {
        return prev;
      }
      const newDomains = [...prev];
      newDomains[index] = {
        ...newDomains[index],
        collections: newDomains[index].collections.concat(collectionId),
      };
      return newDomains;
    });
  };

  const handleRemoveFromCollection = async (
    target: DTO<Target>,
    collectionId: number
  ) => {
    const res = await clientHttpClient(
      `/api/collections/${collectionId}/targets`,
      crypto.randomUUID(),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([target]),
      }
    );

    if (!res.ok) {
      throw res;
    }

    // remove the collection from the target
    setTargets((prev) => {
      const index = prev.findIndex((d) => d.uri === target.uri);
      if (index === -1) {
        return prev;
      }
      const newDomains = [...prev];
      newDomains[index] = {
        ...newDomains[index],
        collections: newDomains[index].collections.filter(
          (c) => c !== collectionId
        ),
      };
      return newDomains;
    });
  };

  const handleFileFormSubmit = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await clientHttpClient("/api/targets", crypto.randomUUID(), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw res;
    }
  };

  const sort = {
    key: router.query.sort as "uri" | keyof IScanSuccessResponse["result"],
    direction: parseInt(router.query.sortDirection as string) as 1 | -1,
  };

  return (
    <DashboardPage
      keycloakIssuer={props.keycloakIssuer}
      title="Domainübersicht"
    >
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
          <div className="w-full border-deepblue-100 border bg-deepblue-500">
            <div className="p-5">
              <div className="text-black">
                <TargetOverviewForm
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
                  selectedTargets.length === 0
                    ? "opacity-50 pointer-events-none"
                    : ""
                )}
              >
                <Menu
                  menuCloseIndex={0}
                  Button={
                    <div className="p-2 bg-deepblue-100 border border-deepblue-100 m-2 flex flex-row items-center justify-center">
                      Gruppenaktionen ({selectedTargets.length})
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
                              selectedTargets.map((d) => scanTarget(d))
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
                menuCloseIndex={0}
                Button={
                  <div className="p-2 bg-deepblue-100 border border-deepblue-100 my-2 flex flex-row items-center justify-center">
                    Zeige: {translateDomainType(viewedDomainType)} (
                    {props.targets.total})
                    <FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                  </div>
                }
                Menu={
                  <MenuList>
                    {Object.values(TargetType).map((type) => (
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
                        selectedTargets.length > 0 &&
                        selectedTargets.length === targets.length
                      }
                      onChange={() => {
                        setSelection((prev) => {
                          return targets.reduce((acc, domain) => {
                            acc[domain.uri] = !Boolean(prev[domain.uri]);
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
                        sortKey="uri"
                        onSort={handleSort}
                        active={sort.key === "uri"}
                        getIcon={() => getIcon("uri")}
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
                        sortKey={TLSInspectionType.DeprecatedTLSDeactivated}
                        onSort={handleSort}
                        active={
                          sort.key ===
                          TLSInspectionType.DeprecatedTLSDeactivated
                        }
                        getIcon={() =>
                          getIcon(TLSInspectionType.DeprecatedTLSDeactivated)
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
                {targets.map((target, i) => {
                  return (
                    <TargetTableItem
                      collections={props.collections}
                      onToggleCollection={(collection) => {
                        if (target.collections.includes(+collection.id)) {
                          return handleRemoveFromCollection(
                            target,
                            collection.id
                          );
                        }
                        return handleAddToCollection(target, collection.id);
                      }}
                      destroy={(uri) => deleteTarget(uri)}
                      scanRequest={scanRequest}
                      scan={(uri) => scanTarget(uri)}
                      key={target.uri}
                      target={target}
                      selected={Boolean(selection[target.uri])}
                      classNames={classNames(
                        i !== targets.length - 1 && "border-b",
                        "border-b-deepblue-300 transition-all",
                        selection[target.uri]
                          ? "bg-deepblue-200"
                          : i % 2 === 0
                          ? "bg-deepblue-400"
                          : "bg-deepblue-500"
                      )}
                      onSelect={(target) => {
                        setSelection((prev) => {
                          if (prev[target.uri] === undefined) {
                            prev[target.uri] = true;
                            return { ...prev };
                          }
                          return {
                            ...prev,
                            [target.uri]: !prev[target.uri],
                          };
                        });
                      }}
                    />
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
              {...props.targets}
            />
          </div>
        </div>
      </div>
    </DashboardPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, prisma]): Promise<ServerSideProps<Props>> => {
    // get the query params.
    const page = +(context.query["page"] ?? 0);
    const search = context.query["search"] as string | undefined;

    const [targets, collections] = await Promise.all([
      targetService.getUserTargetsWithLatestTestResult(
        currentUser,
        {
          pageSize: 50,
          page,
          search,
          type:
            (context.query["domainType"] as TargetType | undefined) ||
            TargetType.all,
          sort: context.query["sort"] as string | undefined,
          sortDirection: context.query["sortDirection"] as string | undefined,
        },
        prisma
      ),
      collectionService.getAllCollectionsOfUser(currentUser, prisma),
    ]);

    const targetCollections = await collectionService.getCollectionsOfTargets(
      targets.data.map((t) => t.uri),
      currentUser,
      prisma
    );

    return {
      props: {
        keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
        targets: {
          ...targets,
          data: targets.data.map((t) => ({
            ...t,
            collections: targetCollections
              .filter((c) => c.uri === t.uri)
              .map((c) => c.collectionId),
          })),
        },
        collections: normalizeToMap(
          toDTO(
            collections.filter((c) => c.id !== currentUser.defaultCollectionId)
          ),
          "id"
        ),
      },
    };
  },
  withCurrentUserServerSideProps,
  withDB
);

export default Targets;
