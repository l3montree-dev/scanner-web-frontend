import {
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Network } from "@prisma/client";
import { GetServerSideProps } from "next";
import { FunctionComponent, useState } from "react";
import AdministrationPage from "../../components/AdministrationPage";
import CreateNetworkForm from "../../components/CreateNetworkForm";
import EditNetworkForm from "../../components/EditNetworkForm";
import Menu from "../../components/common/Menu";
import Modal from "../../components/Modal";
import PageTitle from "../../components/PageTitle";
import SideNavigation from "../../components/SideNavigation";
import Tooltip from "../../components/Tooltip";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withDB } from "../../decorators/withDB";
import { withTokenServerSideProps } from "../../decorators/withToken";
import { clientHttpClient } from "../../services/clientHttpClient";
import { networkService } from "../../services/networkService";
import { classNames, isAdmin } from "../../utils/common";
import DropdownMenuItem from "../../components/common/DropdownMenuItem";
import Button from "../../components/common/Button";

interface Props {
  keycloakIssuer: string;
  networks: Array<Network>;
}
const Network: FunctionComponent<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<Network | null>(null);
  const [networks, setNetworks] = useState(props.networks);
  const onSubmit = async (networks: string[]) => {
    const res = await clientHttpClient("/api/networks", crypto.randomUUID(), {
      method: "POST",
      body: JSON.stringify(networks),
    });
    if (!res.ok) {
      throw res;
    }
    const newNetworks = await res.json();
    setNetworks((prev) => [...newNetworks, ...prev]);
    setIsOpen(false);
  };

  const handleDelete = async (cidr: string) => {
    const res = await clientHttpClient(
      `/api/networks/${cidr}`,
      crypto.randomUUID(),
      {
        method: "DELETE",
      }
    );
    if (!res.ok) {
      throw res;
    }
    setNetworks((prev) => prev.filter((network) => network.cidr !== cidr));
    setEdit(null);
  };

  const handleUpdateNetwork = async (newComment: string) => {
    if (!edit) {
      return;
    }
    const res = await clientHttpClient(
      `/api/networks/${edit.cidr}`,
      crypto.randomUUID(),
      {
        method: "PATCH",
        body: JSON.stringify({
          comment: newComment,
        }),
      }
    );
    if (!res.ok) {
      throw res;
    }
    setNetworks((prev) => {
      const index = prev.findIndex((network) => network.cidr === edit.cidr);
      if (index === -1) {
        return prev;
      }
      const newNetworks = [...prev];
      newNetworks[index] = {
        ...newNetworks[index],
        comment: newComment,
      };
      return newNetworks;
    });
    setEdit(null);
  };

  return (
    <>
      <AdministrationPage
        keycloakIssuer={props.keycloakIssuer}
        title="Netzwerkverwaltung"
      >
        <SideNavigation />
        <div>
          <div className="flex items-start justify-between flex-row">
            <div>
              <div className="text-white mb-10 gap-2 flex flex-row items-center">
                <PageTitle
                  className="text-4xl text-white mb-0 font-bold"
                  stringRep="Netzwerkverwaltung"
                >
                  Netzwerkverwaltung
                </PageTitle>
                <Tooltip
                  tooltip={`         
                Hinzugefügte Netzwerke werden automatisch
                gescanned. So lassen sich Scans von Rechenzentren erstellen.`}
                >
                  <div className="text-slate-400">
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
              Netzwerk hinzufügen
            </Button>
          </div>
          <table className="w-full text-left rounded-md overflow-hidden text-white border-deepblue-100 mt-10 border bg-deepblue-500">
            <thead className="bg-deepblue-200">
              <tr className="text-sm border-b-deepblue-50 text-left">
                <th className="p-2 py-4">CIDR</th>
                <th className="p-2 py-4">Kommentar</th>
                <th className="p-2 py-4">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {networks.map((network, i) => (
                <tr
                  className={classNames(
                    i % 2 !== 0 ? "bg-deepblue-200" : "bg-deepblue-300",
                    i + 1 !== networks.length ? "border-b" : "",
                    "border-b-deepblue-200 transition-all"
                  )}
                  key={network.cidr}
                >
                  <td className="p-2">{network.cidr}</td>
                  <td className="p-2">{network.comment}</td>
                  <td className="p-2 w-20 text-right">
                    <Menu
                      Button={
                        <div className="p-2 h-8 w-8 flex flex-row items-center justify-center">
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </div>
                      }
                      Menu={
                        <>
                          <DropdownMenuItem onClick={() => setEdit(network)}>
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(network.cidr)}
                          >
                            Löschen
                          </DropdownMenuItem>
                        </>
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdministrationPage>
      <Modal
        title="Netzwerk hinzufügen"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <CreateNetworkForm onSubmit={onSubmit} />
      </Modal>
      <Modal
        title="Netzwerk bearbeiten"
        isOpen={Boolean(edit)}
        onClose={() => setEdit(null)}
      >
        {edit && (
          <EditNetworkForm
            {...edit}
            onDelete={() => handleDelete(edit.cidr)}
            onSubmit={handleUpdateNetwork}
          />
        )}
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = decorateServerSideProps(
  async (context, [db, token]) => {
    // check if the user is an admin
    // if not, redirect him to the dashboard page.
    if (!isAdmin(token)) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    return {
      props: {
        networks: await networkService.getAll(db),
        keycloakIssuer: process.env.KEYCLOAK_ISSUER,
      },
    };
  },
  withDB,
  withTokenServerSideProps
);

export default Network;
