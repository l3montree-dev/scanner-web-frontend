import {
  faArrowRight,
  faEllipsisVertical,
  faPen,
  faQuestionCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection, ShareLink } from "@prisma/client";
import Link from "next/link";
import { FunctionComponent, useState } from "react";
import CollectionForm from "../../components/CollectionForm";
import CollectionPill from "../../components/CollectionPill";
import Button from "../../components/common/Button";
import DropdownMenuItem from "../../components/common/DropdownMenuItem";
import Menu from "../../components/common/Menu";
import DashboardPage from "../../components/DashboardPage";
import EditCollectionForm from "../../components/EditCollectionForm";

import Modal from "../../components/Modal";
import PageTitle from "../../components/PageTitle";
import ShareLinkItem from "../../components/ShareLinkItem";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import { clientHttpClient } from "../../services/clientHttpClient";
import { collectionService } from "../../services/collectionService";
import { shareLinkService } from "../../services/shareLinkService";
import { classNames } from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";
import Tooltip from "../../components/Tooltip";

interface Props {
  keycloakIssuer: string;
  collections: Array<DTO<Collection & { shareLinks: Array<DTO<ShareLink>> }>>;
}
const LabelsPage: FunctionComponent<Props> = (props) => {
  const [collections, setCollections] = useState(props.collections);
  const [isOpen, setIsOpen] = useState(false);

  const [selectedCollection, selectCollection] = useState<DTO<
    Collection & { shareLinks: Array<DTO<ShareLink>> }
  > | null>(null);

  const handleCollectionCreate = async (collection: {
    title: string;
    color: string;
  }) => {
    const res = await clientHttpClient(
      `/api/collections`,
      crypto.randomUUID(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collection),
      }
    );

    if (!res.ok) {
      throw res;
    }
    const coll = await res.json();
    setCollections((prev) => {
      return prev.concat(coll);
    });
    setIsOpen(false);
  };

  const destroy = async (id: number) => {
    const res = await clientHttpClient(
      `/api/collections/${id}`,
      crypto.randomUUID(),
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw res;
    }
    setCollections((prev) => {
      return prev.filter((c) => c.id !== id);
    });
  };

  const handleUpdateCollection = async (collection: {
    id: number;
    color: string;
    title: string;
  }) => {
    const res = await clientHttpClient(
      `/api/collections/${collection.id}`,
      crypto.randomUUID(),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collection),
      }
    );

    if (!res.ok) {
      throw res;
    }
    const coll = await res.json();
    setCollections((prev) => {
      return prev.map((c) => {
        if (c.id === coll.id) {
          return coll;
        }
        return c;
      });
    });
    selectCollection(null);
  };

  const handleGenerateLink = async (collectionId: number) => {
    const res = await clientHttpClient(
      `/api/collections/${collectionId}/share`,
      crypto.randomUUID(),
      {
        method: "POST",
      }
    );
    if (!res.ok) {
      throw res;
    }
    const shareLink = await res.json();
    setCollections((prev) => {
      return prev.map((c) => {
        if (c.id === collectionId) {
          return {
            ...c,
            shareLinks: c.shareLinks.concat(shareLink),
          };
        }
        return c;
      });
    });
    // update the selected collection
    selectCollection((prev) => {
      if (prev && prev.id === collectionId) {
        return {
          ...prev,
          shareLinks: prev.shareLinks.concat(shareLink),
        };
      }
      return prev;
    });
  };

  const handleShareLinkDelete = async (shareLink: DTO<ShareLink>) => {
    const res = await clientHttpClient(
      `/api/sharelink/${shareLink.secret}`,
      crypto.randomUUID(),
      {
        method: "DELETE",
      }
    );
    if (!res.ok) {
      throw res;
    }
    setCollections((prev) => {
      return prev.map((c) => {
        if (c.id === shareLink.collectionId) {
          return {
            ...c,
            shareLinks: c.shareLinks.filter(
              (sl) => sl.secret !== shareLink.secret
            ),
          };
        }
        return c;
      });
    });
    // update the selected collection
    selectCollection((prev) => {
      if (prev && prev.id === shareLink.collectionId) {
        return {
          ...prev,
          shareLinks: prev.shareLinks.filter(
            (sl) => sl.secret !== shareLink.secret
          ),
        };
      }
      return prev;
    });
  };

  return (
    <DashboardPage title="Gruppen" keycloakIssuer={props.keycloakIssuer}>
      <SideNavigation />
      <>
        <div className="flex-1">
          <div className="lg:flex lg:flex-row w-full flex-wrap  items-start justfy-between mb-12 lg:mb-0">
            <div className="flex-1">
              <div className=" mb-10 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-2xl  mb-0 font-bold"
                  stringRep="Gruppen"
                >
                  Gruppen
                </PageTitle>
                <Tooltip
                  tooltip={`Gruppen dienen der Sortierung einzelner Domains. Es ist möglich Gruppen direkt miteinander zu vergleichen.`}
                >
                  <div className="text-dunkelgrau-100">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </div>
                </Tooltip>
              </div>
            </div>
            <Button
              type="button"
              loading={false}
              onClick={() => setIsOpen(true)}
            >
              Gruppe hinzufügen
            </Button>
          </div>

          <table className="w-full text-left overflow-hidden border-separate border-spacing-2">
            <thead className="hidden lg:table-header-group">
              <tr className="text-sm rounded-t-md bg-blau-100 text-left text-white">
                <th className="p-2 py-4">Titel</th>
                <th className="p-2 py-4">Domains</th>
                <th className="p-2 py-4">
                  Link für externen, lesenden Zugriff ohne Account
                </th>
                <th className="p-2 py-4">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection, i, arr) => {
                return (
                  <tr
                    className={classNames(
                      "mt-3 lg:table-row relative p-1 lg:p-0 flex flex-col flex-wrap justify-between rounded-md lg:mt-0 lg:rounded-none",
                      " group/collection-item",
                      i !== arr.length - 1 && "border-b",
                      "border-b-deepblue-300 transition-all",
                      i % 2 !== 0 ? "bg-blau-20/40" : "bg-dunkelblau-20/20"
                    )}
                    key={collection.id}
                  >
                    <td className="p-2 text-sm">
                      <div className="flex">
                        <CollectionPill selected {...collection} />
                      </div>
                    </td>

                    <td className="p-2 text-sm text-blau-100">
                      <Link
                        href={`/dashboard/targets?collectionIds=${collection.id}`}
                      >
                        Domains der Gruppe ansehen
                        <FontAwesomeIcon className="ml-2" icon={faArrowRight} />
                      </Link>
                    </td>
                    <td
                      className={classNames(
                        "order-2 md:w-auto px-2 w-full",
                        collection.shareLinks.length > 0
                          ? "px-2 "
                          : "hidden md:table-cell"
                      )}
                    >
                      <div className="py-2 flex flex-col gap-2">
                        {collection.shareLinks.map((shareLink) => {
                          return (
                            <ShareLinkItem
                              onDelete={() => handleShareLinkDelete(shareLink)}
                              shareLink={shareLink}
                              key={shareLink.secret}
                            />
                          );
                        })}

                        {collection.shareLinks.length === 0 && (
                          <div className="flex opacity-0 group-hover/collection-item:opacity-100 transition-all text-sm flex-row justify-end">
                            <Button
                              onClick={() => handleGenerateLink(collection.id)}
                            >
                              Link erstellen
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      className="text-right lg:static absolute top-0 right-0 p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-row justify-end">
                        <Menu
                          Button={
                            <Button className="w-10 h-10">
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                            </Button>
                          }
                          Menu={
                            <>
                              <DropdownMenuItem
                                Icon={
                                  <FontAwesomeIcon icon={faPen} fontSize={15} />
                                }
                                onClick={() => selectCollection(collection)}
                              >
                                Bearbeiten / Teilen
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                Icon={
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    fontSize={15}
                                  />
                                }
                                onClick={() => destroy(collection.id)}
                              >
                                <div>Löschen</div>
                              </DropdownMenuItem>
                            </>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Modal
          title="Gruppe hinzufügen"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <CollectionForm onCreate={handleCollectionCreate} />
        </Modal>
        <Modal
          title="Gruppe bearbeiten"
          onClose={() => selectCollection(null)}
          isOpen={Boolean(selectedCollection)}
        >
          {selectedCollection && (
            <EditCollectionForm
              onShareLinkDelete={handleShareLinkDelete}
              onGenerateLink={handleGenerateLink}
              collection={selectedCollection}
              onSubmit={handleUpdateCollection}
            />
          )}
        </Modal>
      </>
    </DashboardPage>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, prisma]): Promise<ServerSideProps<Props>> => {
    const [collections, links] = await Promise.all([
      collectionService.getAllCollectionsOfUser(currentUser, prisma),
      shareLinkService.getShareLinksOfUser(currentUser, prisma),
    ]);

    return {
      props: {
        keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
        collections: toDTO(
          collections
            .filter((c) => c.id !== currentUser.defaultCollectionId)
            .map((c) => ({
              ...c,
              shareLinks: toDTO(links.filter((l) => l.collectionId === c.id)),
            }))
        ),
      },
    };
  },
  withCurrentUserServerSideProps,
  withDB
);
export default LabelsPage;
