import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection } from "@prisma/client";
import Link from "next/link";
import { FunctionComponent, useState } from "react";
import CollectionForm from "../../components/CollectionForm";
import DashboardPage from "../../components/DashboardPage";
import EditCollectionForm from "../../components/EditCollectionForm";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Modal from "../../components/Modal";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withCurrentUserServerSideProps } from "../../decorators/withCurrentUser";
import { withDB } from "../../decorators/withDB";
import useLoading from "../../hooks/useLoading";
import { clientHttpClient } from "../../services/clientHttpClient";
import { collectionService } from "../../services/collectionService";
import { classNames } from "../../utils/common";
import { DTO, ServerSideProps, toDTO } from "../../utils/server";

interface Props {
  keycloakIssuer: string;
  collections: Array<DTO<Collection>>;
}
const LabelsPage: FunctionComponent<Props> = (props) => {
  const [collections, setCollections] = useState(props.collections);

  const updateRequest = useLoading();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");
  const [selectedCollection, selectCollection] =
    useState<DTO<Collection> | null>(null);

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

  return (
    <>
      <DashboardPage title="Sammlungen" keycloakIssuer={props.keycloakIssuer}>
        <SideNavigation />
        <div className="flex-1">
          <h1 className="text-4xl mb-5 font-bold text-white ">Sammlungen</h1>
          <div className="flex flex-row mb-10">
            <p className="text-slate-300">
              Sammlungen dienen der Sortierung einzelner Domains. Es ist möglich
              Sammlungen direkt miteinander zu vergleichen.
            </p>
          </div>
          <div className="w-full border-deepblue-100 border bg-deepblue-500">
            <div className="p-5">
              <CollectionForm onCreate={handleCollectionCreate} />
            </div>
            <table className="w-full text-white ">
              <thead>
                <tr className="bg-deepblue-200 text-sm border-b border-t border-deepblue-50 text-left">
                  <th className="p-2">Titel</th>
                  <th className="p-2">Domains</th>
                  <th className="p-2 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection, i, arr) => {
                  return (
                    <tr
                      className={classNames(
                        i !== arr.length - 1 && "border-b",
                        "border-b-deepblue-300 transition-all",
                        i % 2 === 0 ? "bg-deepblue-400" : "bg-deepblue-500"
                      )}
                      key={collection.id}
                    >
                      <td className="p-2 text-sm">
                        <div>
                          <div className="bg-deepblue-200 inline-block px-2 py-1 rounded-full border-deepblue-50 border">
                            <div
                              className="w-3 h-3 inline-block mr-2 rounded-full"
                              style={{
                                backgroundColor: collection.color,
                              }}
                            />
                            {collection.title}
                          </div>
                        </div>
                      </td>

                      <td className="p-2 underline">
                        <Link
                          href={`/dashboard/targets?collectionId=${collection.id}`}
                        >
                          Zu den Domains der Sammlung
                        </Link>
                      </td>
                      <td
                        className="text-right p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-row justify-end">
                          <Menu
                            menuCloseIndex={0}
                            Button={
                              <div className="p-2 h-8 w-8 flex flex-row items-center justify-center">
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                              </div>
                            }
                            Menu={
                              <MenuList>
                                <MenuItem
                                  onClick={() => selectCollection(collection)}
                                >
                                  <div>
                                    <div>Bearbeiten</div>
                                  </div>
                                </MenuItem>

                                <MenuItem
                                  onClick={() => destroy(collection.id)}
                                >
                                  <div>Löschen</div>
                                </MenuItem>
                              </MenuList>
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
        </div>
      </DashboardPage>
      <Modal
        title="Sammlung bearbeiten"
        onClose={() => selectCollection(null)}
        isOpen={Boolean(selectedCollection)}
      >
        {selectedCollection && (
          <EditCollectionForm
            collection={selectedCollection}
            onSubmit={handleUpdateCollection}
          />
        )}
      </Modal>
    </>
  );
};

export const getServerSideProps = decorateServerSideProps(
  async (context, [currentUser, prisma]): Promise<ServerSideProps<Props>> => {
    const collections = await collectionService.getAllCollectionsOfUser(
      currentUser,
      prisma
    );
    return {
      props: {
        keycloakIssuer: process.env.KEYCLOAK_ISSUER as string,
        collections: toDTO(collections),
      },
    };
  },
  withCurrentUserServerSideProps,
  withDB
);
export default LabelsPage;
