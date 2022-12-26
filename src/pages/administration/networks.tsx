import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetServerSideProps } from "next";
import { FunctionComponent, useState } from "react";
import AdministrationPage from "../../components/AdministrationPage";
import Button from "../../components/Button";
import CreateNetworkForm from "../../components/CreateNetworkForm";
import Menu from "../../components/Menu";
import MenuItem from "../../components/MenuItem";
import MenuList from "../../components/MenuList";
import Modal from "../../components/Modal";
import SideNavigation from "../../components/SideNavigation";
import { decorateServerSideProps } from "../../decorators/decorateServerSideProps";
import { withDB } from "../../decorators/withDB";
import { withTokenServerSideProps } from "../../decorators/withToken";
import { clientHttpClient } from "../../services/clientHttpClient";
import { getAll } from "../../services/networkService";
import { INetwork } from "../../types";
import { classNames, isAdmin } from "../../utils/common";

interface Props {
  networks: Array<INetwork & { users: Array<{ id: string }> }>;
}
const Network: FunctionComponent<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
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
  return (
    <>
      <AdministrationPage title="Netzwerkverwaltung">
        <SideNavigation />
        <div>
          <div className="flex items-start flex-row">
            <div>
              <h1 className="text-4xl mb-5 text-white font-bold">
                Netzwerkverwaltung
              </h1>
              <p className="text-white w-1/2">
                Füge neue Netzwerke dem System hinzu. Diese müssen nicht
                zwingend von einem CISO verwaltet werden. Alle nicht verwalteten
                Netzwerke werden verwendet um einen Vergleich mit den Netzwerken
                der CISOs zu ermöglichen.
              </p>
            </div>
            <Button
              className="bg-deepblue-200 border-deepblue-200 border hover:bg-deepblue-300 transition-all py-3 px-5 text-white"
              type="button"
              loading={false}
              onClick={() => setIsOpen(true)}
            >
              Netzwerk hinzufügen
            </Button>
          </div>
          <table className="w-full text-left text-white w-full border-deepblue-500 mt-10 bg-deepblue-400">
            <thead>
              <tr className="bg-deepblue-100  text-sm border-b border-b-deepblue-500 text-left">
                <th className="p-2 py-4">CIDR</th>
                <th className="p-2 py-4">Verwaltet</th>
                <th className="p-2 py-4">Kommentar</th>
                <th className="p-2 py-4">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {networks.map((network, i) => (
                <tr
                  className={classNames(
                    i + 1 !== networks.length ? "border-bg" : "",
                    "border-b border-b-deepblue-500 transition-all"
                  )}
                  key={network.id}
                >
                  <td className="p-2">{network.cidr}</td>
                  <td className="p-2">
                    {network.users.length > 0
                      ? `ja (${network.users.length})`
                      : "nein"}
                  </td>
                  <td className="p-2">{network.comment}</td>
                  <td className="p-2 w-20 text-right">
                    <Menu
                      Button={
                        <div className="p-2 h-8 w-8 flex flex-row items-center justify-center">
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </div>
                      }
                      Menu={
                        <MenuList>
                          <MenuItem onClick={() => console.log("scannen")}>
                            Bearbeiten
                          </MenuItem>
                          <MenuItem onClick={() => console.log("scannen")}>
                            Löschen
                          </MenuItem>
                        </MenuList>
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
        networks: await getAll(db),
      },
    };
  },
  withDB,
  withTokenServerSideProps
);

export default Network;
