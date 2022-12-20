import { GetServerSideProps } from "next";
import Meta from "../components/Meta";
import Page from "../components/Page";
import { decorateServerSideProps } from "../decorators/decorateServerSideProps";

import { withCurrentUser } from "../decorators/withCurrentUser";
import { withDB } from "../decorators/withDB";
import { getAllDomainsOfNetwork } from "../services/domainService";

const Dashboard = () => {
  return (
    <Page>
      <Meta title="Dashboard" />
      <div></div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = decorateServerSideProps(
  async (context, [currentUser, db]) => {
    // fetch the user object.;
    console.log(currentUser);

    getAllDomainsOfNetwork(currentUser.networks[0], db.Domain);
    return {
      props: {},
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
