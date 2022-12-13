import { GetServerSideProps } from "next";
import React from "react";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

const Dashboard = () => {
  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  console.log(session);

  return {
    props: {
      redirect: "/",
      // props for your component
    },
  };
};

export default Dashboard;
