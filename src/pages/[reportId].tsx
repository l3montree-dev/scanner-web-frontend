import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { FunctionComponent, useMemo } from "react";
import Page from "../components/Page";
import TLS from "../components/report-content/TLS";
import SideNav from "../components/SideNav";
import getConnection from "../db/connection";
import { toDTO, WithId } from "../db/models";
import { IDetailedReport } from "../db/report";
import useHash from "../hooks/useHash";

// Maybe use lazy loading in the future.
const hashComponentMapping: {
  [hash: string]: (
    props: WithId<IDetailedReport>
  ) => React.ReactElement<WithId<IDetailedReport>, any>;
} = {
  tls: TLS,
};
const ReportId: FunctionComponent<{ report: WithId<IDetailedReport> }> = (
  props
) => {
  const hash = useHash();
  const Component = useMemo(() => hashComponentMapping[hash], [hash]);
  return (
    <Page>
      <div className="flex flex-1 flex-row">
        <SideNav {...props.report} />
        {Boolean(Component) && <Component {...props.report} />}
      </div>
    </Page>
  );
};

export default ReportId;

export const getServerSideProps: GetServerSideProps<{
  report: WithId<IDetailedReport>;
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
  const report = await connection.models.DetailedReport.findById(
    reportId
  ).lean();
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
