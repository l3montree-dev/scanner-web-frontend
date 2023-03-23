import {
  faCaretDown,
  faCaretUp,
  faCheck,
  faQuestion,
  faQuestionCircle,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Checkbox from "../../components/Checkbox";
import DashboardPage from "../../components/DashboardPage";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Pagination from "../../components/Pagination";
import SideNavigation from "../../components/SideNavigation";
import TargetOverviewForm from "../../components/TargetOverviewForm";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserOrGuestServerSideProps } from "../../decorators/withCurrentUser";
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

import { Collection, Target } from "@prisma/client";
import CollectionMenu from "../../components/CollectionMenu";
import CollectionPill from "../../components/CollectionPill";
import PageTitle from "../../components/PageTitle";
import { SortButton } from "../../components/SortButton";
import TargetTableItem from "../../components/TargetTableItem";
import Tooltip from "../../components/Tooltip";
import { collectionService } from "../../services/collectionService";
import {
  DetailedTarget,
  IScanSuccessResponse,
  PaginateResult,
  TargetType,
} from "../../types";
import {
  classNames,
  collectionId,
  isGuestUser,
  normalizeToMap,
} from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import { optimisticUpdate } from "../../utils/view";
import { useIsGuest } from "../../hooks/useIsGuest";
import CheckStateMenu from "../../components/CheckStateMenu";

interface Props {
  targets: PaginateResult<DTO<DetailedTarget> & { collections?: number[] }>; // should include array of collection ids the target is in
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
    Array<DTO<DetailedTarget> & { collections?: number[] }>
  >(props.targets.data);

  const [selection, setSelection] = useState<{ [uri: string]: boolean }>({});
  const scanAllLoading = useLoading();

  const isGuest = useIsGuest();
  const scanRequest = useLoading();
  const router = useRouter();

  const viewedDomainType =
    (router.query.domainType as TargetType | undefined) ?? TargetType.all;
  const handleSort = (key: "uri") => {
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

  const handleFilterCheckState = (
    key: InspectionType,
    value: 1 | 0 | -1 | undefined
  ) => {
    if (value === undefined) {
      const { [key]: _, ...query } = router.query;
      router.push({
        pathname: router.pathname,
        query: {
          ...query,
        },
      });
      return;
    }
    patchQuery({
      [key]: value.toString(),
    });
  };

  const getIcon = (key: InspectionType | "uri") => {
    if (sort.key === key) {
      return sort.direction === 1 ? faCaretUp : faCaretDown;
    }
    return faCaretUp;
  };

  const patchQuery = useCallback(
    (query: Record<string, string | string[]>) => {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          ...query,
        },
      });
      setSelection({});
    },
    [router]
  );

  useEffect(() => {
    setTargets(props.targets.data);
  }, [props.targets]);

  const deleteTarget = async (uri: string) => {
    // do an optimistic update
    const revert = optimisticUpdate(targets, setTargets, (prev) =>
      prev.filter((d) => d.uri !== uri)
    );
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
    if (!response.ok) {
      revert();
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
    target: DTO<{ uri: string }[]>,
    collectionId: number
  ) => {
    const uris = target.map((d) => d.uri);
    // do an optimistic update.
    const revert = optimisticUpdate(targets, setTargets, (prev) => {
      return prev.map((d) => {
        if (uris.includes(d.uri)) {
          return {
            ...d,
            collections: (d.collections ?? []).concat(collectionId),
          };
        }
        return d;
      });
    });

    const res = await clientHttpClient(
      `/api/collections/${collectionId}/targets`,
      crypto.randomUUID(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(target),
      }
    );

    if (!res.ok) {
      // revert the optimistic update
      revert();
      throw res;
    }
  };

  const handleRemoveFromCollection = async (
    target: DTO<Target[]>,
    collectionId: number
  ) => {
    const uris = target.map((d) => d.uri);
    // do an optimistic update
    const revert = optimisticUpdate(targets, setTargets, (prev) => {
      return prev.map((d) => {
        if (uris.includes(d.uri)) {
          return {
            ...d,
            collections: (d.collections ?? []).filter(
              (c) => c !== collectionId
            ),
          };
        }
        return d;
      });
    });

    const res = await clientHttpClient(
      `/api/collections/${collectionId}/targets`,
      crypto.randomUUID(),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(target),
      }
    );

    if (!res.ok) {
      revert();
      throw res;
    }
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

  const collectionIds = useMemo(() => {
    const collections = (router.query.collectionIds as string | string[]) ?? [];
    return (Array.isArray(collections) ? collections : [collections]).map(
      (c) => +c
    );
  }, [router.query.collectionIds]);

  const handleCollectionFilterToggle = useCallback(
    (collectionId: number) => {
      if (collectionIds.includes(collectionId)) {
        patchQuery({
          collectionIds: collectionIds
            .filter((c) => c !== collectionId)
            .map((c) => c.toString()),
        });
      } else {
        patchQuery({
          collectionIds: collectionIds
            .concat(collectionId)
            .map((c) => c.toString()),
        });
      }
    },
    [collectionIds, patchQuery]
  );

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
        <div className="text-white mb-10 gap-2 flex flex-row items-center">
          <PageTitle
            className="text-4xl text-white mb-0 font-bold"
            stringRep="Domainübersicht"
          >
            Domainübersicht
          </PageTitle>
          <Tooltip
            tooltip={`         
                  Auf der Domainübersicht finden Sie alle Testergebnisse für Ihre
                  Domains auf einen Blick. Hier können Sie schnell und einfach
                  vergleichen, wie gut die verschiedenen Domains in Bezug auf die
                  verschiedenen ausgeführten Sicherheitstest abschneiden.`}
          >
            <div className="text-slate-400">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </div>
          </Tooltip>
        </div>
        <div className="text-white">
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
              {!isGuest && (
                <div
                  className={classNames(
                    "flex flex-row justify-start",
                    selectedTargets.length === 0
                      ? "opacity-50 pointer-events-none"
                      : ""
                  )}
                >
                  <div className="my-2 ml-2">
                    <Menu
                      menuCloseIndex={0}
                      Button={
                        <div className="p-2 bg-deepblue-100 border border-deepblue-100 flex flex-row items-center justify-center">
                          Gruppenaktionen ({selectedTargets.length})
                          <FontAwesomeIcon
                            className="ml-2"
                            icon={faCaretDown}
                          />
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
                          <CollectionMenu
                            nestedMenu
                            collections={props.collections}
                            onCollectionClick={(c) =>
                              handleAddToCollection(
                                selectedTargets.map((s) => ({ uri: s })),
                                c.id
                              )
                            }
                            Button={
                              <div className="p-2 px-4 text-left">
                                Zu Gruppe hinzufügen
                              </div>
                            }
                          />
                        </MenuList>
                      }
                    />
                  </div>
                </div>
              )}
              <div className="ml-2 my-2">
                <Menu
                  menuCloseIndex={0}
                  Button={
                    <div className="p-2  bg-deepblue-100 border border-deepblue-100 flex flex-row items-center justify-center">
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
              {Object.keys(props.collections).length > 0 && (
                <div className="my-2 ml-2">
                  <CollectionMenu
                    collections={props.collections}
                    selectedCollections={collectionIds}
                    onCollectionClick={(c) =>
                      handleCollectionFilterToggle(c.id)
                    }
                    Button={
                      <div className="p-2 bg-deepblue-100 border border-deepblue-100 flex flex-row items-center justify-center">
                        Filter nach Gruppen
                        <FontAwesomeIcon className="ml-2" icon={faCaretDown} />
                      </div>
                    }
                  />
                </div>
              )}
              {Object.keys(router.query).length > 0 && (
                <button
                  onClick={() => {
                    router.push({
                      pathname: router.pathname,
                      query: {},
                    });
                  }}
                  className="bg-deepblue-100 border border-deepblue-100 hover:bg-deepblue-300 transition-all my-2 ml-2 px-2"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>

            {collectionIds.length > 0 && (
              <div className="flex flex-row py-2 border-b border-deepblue-100 items-center">
                <div className="flex flex-wrap flex-row gap-2 px-5 items-center pl-4 justify-start">
                  {collectionIds.map((c) => {
                    const col = props.collections[c.toString()];
                    return (
                      <CollectionPill
                        onRemove={() => {
                          handleCollectionFilterToggle(c);
                        }}
                        key={col.id}
                        {...col}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            <table className="w-full">
              <thead className="sticky top-14 z-100">
                <tr className="bg-deepblue-200 text-sm border-b border-b-deepblue-50 text-left">
                  <th className="p-2 pr-0">
                    {!isGuest && (
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
                    )}
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
                    <CheckStateMenu
                      onChange={handleFilterCheckState}
                      inspectionType={
                        OrganizationalInspectionType.ResponsibleDisclosure
                      }
                    />
                  </th>
                  <th className="p-2">
                    <div>
                      <CheckStateMenu
                        onChange={handleFilterCheckState}
                        inspectionType={TLSInspectionType.TLSv1_3}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <CheckStateMenu
                        onChange={handleFilterCheckState}
                        inspectionType={
                          TLSInspectionType.DeprecatedTLSDeactivated
                        }
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <CheckStateMenu
                        onChange={handleFilterCheckState}
                        inspectionType={HeaderInspectionType.HSTS}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <CheckStateMenu
                        onChange={handleFilterCheckState}
                        inspectionType={DomainInspectionType.DNSSec}
                      />
                    </div>
                  </th>
                  <th className="p-2">
                    <div>
                      <CheckStateMenu
                        onChange={handleFilterCheckState}
                        inspectionType={NetworkInspectionType.RPKI}
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
                        if (
                          target.collections &&
                          target.collections.includes(+collection.id)
                        ) {
                          return handleRemoveFromCollection(
                            [target],
                            collection.id
                          );
                        }
                        return handleAddToCollection([target], collection.id);
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
    const collectionIdsStr =
      (context.query["collectionIds"] as string | string[] | undefined) ?? "";

    const collectionIds = (
      Array.isArray(collectionIdsStr) ? collectionIdsStr : [collectionIdsStr]
    )
      .map((id) => +id)
      .filter((id) => id > 0);

    const [targets, collections] = await Promise.all([
      targetService.getUserTargetsWithLatestTestResult(
        currentUser,
        {
          ...context.query,
          pageSize: 50,
          page,
          search,
          collectionIds,
          type:
            (context.query["domainType"] as TargetType | undefined) ||
            TargetType.all,
          sortDirection: context.query["sortDirection"] as string | undefined,
        },
        prisma
      ),
      collectionService.getAllCollectionsOfUser(currentUser, prisma),
    ]);

    const targetCollections = isGuestUser(currentUser)
      ? []
      : await collectionService.getCollectionsOfTargets(
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
          toDTO(collections.filter((c) => c.id !== collectionId(currentUser))),
          "id"
        ),
      },
    };
  },
  withCurrentUserOrGuestServerSideProps,
  withDB
);

export default Targets;
