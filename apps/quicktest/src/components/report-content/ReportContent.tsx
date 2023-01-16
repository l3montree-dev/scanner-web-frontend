import React, { FunctionComponent, PropsWithChildren } from "react";

interface Props {
  title: string;
  subtitle: string;
  Result: React.ReactNode;
  ManagementSummary: React.ReactNode;
  Description: React.ReactNode;
  TechnicalImplementation: React.ReactNode;
  EffortEstimation: React.ReactNode;
  TechnicalImplementationAdditional?: React.ReactNode;
  DescriptionAdditional?: React.ReactNode;
}

const ReportContent: FunctionComponent<Props> = (props) => {
  return (
    <article className="text-white flex-1 p-10 mx-10">
      <p className="opacity-75">{props.subtitle}</p>
      <h1 className="text-4xl font-bold">{props.title}</h1>
      <div className="mt-10 mb-20">{props.Result}</div>
      <div className="mt-10 flex flex-row">
        <div className="mr-12 bg-deepblue-300 w-full flex-grow p-3 -m-3">
          <h2 className="text-2xl font-bold">Management Summary</h2>
          <div className="mt-2 ">{props.ManagementSummary}</div>
        </div>
        <div className="-m-3 mr-0 bg-deepblue-300 p-4">
          <div className="w-64">{props.EffortEstimation}</div>
        </div>
      </div>
      <div className="mt-14 flex flex-row">
        <div className="mr-12">
          <h2 className="text-2xl font-bold">Erläuterung</h2>
          <div className="mt-2">{props.Description}</div>
        </div>
        {props.DescriptionAdditional !== undefined && (
          <div className="bg-deepblue-300 p-4">
            <div className="w-64">{props.DescriptionAdditional}</div>
          </div>
        )}
      </div>
      <div className="mt-10 flex flex-row">
        <div className="mr-12">
          <h2 className="text-2xl font-bold">Technischer Umsetzungsansatz</h2>
          <div className="mt-2">{props.TechnicalImplementation}</div>
        </div>
        {props.TechnicalImplementationAdditional !== undefined && (
          <div className="bg-deepblue-300 p-4">
            <div className="w-64">
              {props.TechnicalImplementationAdditional}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default ReportContent;
