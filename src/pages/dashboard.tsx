import { GetServerSideProps } from "next";
import Meta from "../components/Meta";
import Page from "../components/Page";
import { decorateServerSideProps } from "../decorators/decorate";
import { withCurrentUser } from "../decorators/withCurrentUser";
import { withDB } from "../decorators/withDB";

const Dashboard = () => {
  return (
    <Page>
      <Meta title="Dashboard" />
      <div></div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = decorateServerSideProps(
  async (context, { currentUser, Domain }) => {
    // fetch the user object.;
    return {
      props: {},
    };
  },
  withCurrentUser,
  withDB
);

export default Dashboard;
