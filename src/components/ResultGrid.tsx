import { FunctionComponent } from "react";
import { getCAAReportMessage } from "../messages/caa";
import { getDNSSecReportMessage } from "../messages/dnsSec";
import { getHSTSReportMessage } from "../messages/hsts";
import { getResponsibleDisclosureReportMessage } from "../messages/responsibleDisclosure";
import getRPKIReportMessage from "../messages/rpki";
import { getTLSv1_1_DeactivatedReportMessage } from "../messages/tlsv1_1_Deactivated";

import { getTLSv1_3ReportMessage } from "../messages/tlsv1_3";
import { IReport } from "../types";
import { classNames, linkMapper } from "../utils/common";

import ResultBox from "./ResultBox";

const borderClass = (didPass: boolean | null) => {
  return didPass === null
    ? "border-white"
    : didPass
    ? "border-lightning-500"
    : "border-red-500";
};

const messages = {
  DNSSec: getDNSSecReportMessage,
  CAA: getCAAReportMessage,
  TLSv1_3: getTLSv1_3ReportMessage,
  TLSv1_1_Deactivated: getTLSv1_1_DeactivatedReportMessage,
  HSTS: getHSTSReportMessage,
  ResponsibleDisclosure: getResponsibleDisclosureReportMessage,
  RPKI: getRPKIReportMessage,
};

const getDescription = (
  report: IReport,
  key:
    | "DNSSec"
    | "CAA"
    | "TLSv1_3"
    | "TLSv1_1_Deactivated"
    | "HSTS"
    | "ResponsibleDisclosure"
    | "RPKI"
): string => {
  return messages[key](report);
};
interface Props {
  report: IReport;
}
const ResultGrid: FunctionComponent<Props> = (props) => {
  const { report } = props;
  return (
    <div className="flex-row flex flex-wrap mt-3">
      <div className="md:w-1/3 sm:w-1/2 w-full md:mb-4 mb-5 sm:pr-2">
        <div
          className={classNames(
            "bg-deepblue-400 border h-full p-5",
            borderClass(report.result.ResponsibleDisclosure.didPass)
          )}
        >
          <ResultBox
            title="Responsible Disclosure"
            description={getDescription(report, "ResponsibleDisclosure")}
            link={linkMapper["ResponsibleDisclosure"]}
            didPass={report.result.ResponsibleDisclosure.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full sm:pl-2 md:px-2 md:mb-4 mb-5">
        <div
          className={classNames(
            "bg-deepblue-400 border h-full p-4",
            borderClass(report.result.TLSv1_3.didPass)
          )}
        >
          <ResultBox
            title="TLS 1.3"
            description={getDescription(report, "TLSv1_3")}
            link={linkMapper["TLSv1_3"]}
            didPass={report.result.TLSv1_3.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full sm:pr-2 md:pr-0 md:pl-2 md:mb-4 mb-5">
        <div
          className={classNames(
            "bg-deepblue-400 border h-full p-4",
            borderClass(report.result.TLSv1_1_Deactivated.didPass)
          )}
        >
          <ResultBox
            title="Deaktivierung von veralteten TLS/ SSL Protokollen"
            description={getDescription(report, "TLSv1_1_Deactivated")}
            link={linkMapper["TLSv1_1_Deactivated"]}
            didPass={report.result.TLSv1_1_Deactivated.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full md:mb-4 mb-5 sm:pl-2 md:pl-0 md:pr-2">
        <div
          className={classNames(
            "bg-deepblue-400 border h-full p-4",
            borderClass(report.result.HSTS.didPass)
          )}
        >
          <ResultBox
            title="HSTS"
            description={getDescription(report, "HSTS")}
            link={linkMapper["HSTS"]}
            didPass={report.result.HSTS.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full sm:pr-2 md:mb-4 mb-5 md:px-2">
        <div
          className={classNames(
            "bg-deepblue-400 border h-full p-4",
            borderClass(report.result.DNSSec.didPass)
          )}
        >
          <ResultBox
            title="DNSSEC"
            description={getDescription(report, "DNSSec")}
            link={linkMapper["DNSSec"]}
            didPass={report.result.DNSSec.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full md:mb-4 mb-5 sm:pl-2">
        <div
          className={classNames(
            "bg-deepblue-400 border h-full p-4",
            borderClass(report.result.RPKI.didPass)
          )}
        >
          <ResultBox
            title="RPKI"
            description={getDescription(report, "RPKI")}
            didPass={report.result.RPKI.didPass}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultGrid;
