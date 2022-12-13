import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import React, { useEffect } from "react";
import { clientHttpClient } from "../../services/clientHttpClient";
import { isAdmin } from "../../utils/common";
import { authOptions } from "../api/auth/[...nextauth]";

const Administration = () => {
  useEffect(() => {
    clientHttpClient("/api/administration", crypto.randomUUID()).then(
      (res) => {}
    );
  }, []);
  return <div></div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  // check if the user is an admin
  // if not, redirect him to the dashboard page.
  if (!isAdmin(session)) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Administration;
