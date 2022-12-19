import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import Meta from "../components/Meta";
import Page from "../components/Page";
import { decorateServerSideProps } from "../decorators/decorate";
import { withCurrentUser } from "../decorators/withCurrentUser";
import { IUser } from "../types";
import { authOptions } from "./api/auth/[...nextauth]";
import { Document } from "mongoose";

const Dashboard = () => {
  return (
    <Page>
      <Meta title="Dashboard" />
      <div></div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = decorateServerSideProps(
  async (context, params: { currentUser: Document<IUser> }) => {
    const session = await unstable_getServerSession(
      context.req,
      context.res,
      authOptions
    );

    // fetch the user object.

    return {
      props: {},
    };
  },
  withCurrentUser
);

export default Dashboard;
