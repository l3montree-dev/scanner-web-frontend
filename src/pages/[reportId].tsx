import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { FunctionComponent } from "react";
import getConnection from "../db/connection";
import { toDTO, WithId } from "../db/models";
import { IReport } from "../db/report";

const ReportId: FunctionComponent<{ report: WithId<IReport> }> = (props) => {
  console.log(props);
  return <div></div>;
};

export default ReportId;

export const getServerSideProps: GetServerSideProps<{
  report: WithId<IReport>;
}> = async (context: GetServerSidePropsContext) => {
  const reportId = context.params?.reportId;
  if (!reportId) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
    };
  }
  // fetch the report from the database.
  const connection = await getConnection();
  const report = await connection.models.Report.findById(reportId).lean();
  if (!report) {
    return {
      redirect: {
        permanent: true,
        destination: "/",
      },
    };
  }
  return {
    props: {
      report: toDTO(report),
    },
  };
};
