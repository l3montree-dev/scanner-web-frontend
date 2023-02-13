import { FunctionComponent } from "react";
import { CertificateInspectionType, InspectionType } from "../inspection/scans";
import { getCAAReportMessage } from "../messages/caa";
import { getDNSSecReportMessage } from "../messages/dnsSec";
import { getHSTSReportMessage } from "../messages/hsts";
import { getResponsibleDisclosureReportMessage } from "../messages/responsibleDisclosure";
import getRPKIReportMessage from "../messages/rpki";
import { getTLSv1_1_DeactivatedReportMessage } from "../messages/tlsv1_1_Deactivated";
import { getTLSv1_3ReportMessage, tlsCriticalKeys } from "../messages/tlsv1_3";
import { DetailedDomain } from "../types";
import { classNames, linkMapper } from "../utils/common";
import {
  CheckResult,
  checkResult2BorderClassName,
  didPass2CheckResult,
} from "../utils/view";

import ResultBox from "./ResultBox";

const messages = {
  ResponsibleDisclosure: getResponsibleDisclosureReportMessage,
  TLSv1_3: getTLSv1_3ReportMessage,
  TLSv1_1_Deactivated: getTLSv1_1_DeactivatedReportMessage,
  HSTS: getHSTSReportMessage,
  DNSSec: getDNSSecReportMessage,
  RPKI: getRPKIReportMessage,
};

const titleMapper = {
  DNSSec: "DNSSEC",
  RPKI: "RPKI",
  TLSv1_3: "TLS 1.3",
  TLSv1_1_Deactivated: "Deaktivierung von veralteten TLS/ SSL Protokollen",
  HSTS: "HSTS",
  ResponsibleDisclosure: "Responsible Disclosure",
};

const getDescription = (
  report: DetailedDomain,
  key:
    | "DNSSec"
    | "TLSv1_3"
    | "TLSv1_1_Deactivated"
    | "HSTS"
    | "ResponsibleDisclosure"
    | "RPKI"
): string => {
  return messages[key](report);
};
interface Props {
  report: DetailedDomain;
}

const didPass2CheckResultWithCritical = (
  key: InspectionType,
  report: DetailedDomain
): CheckResult => {
  if (
    key === "TLSv1_3" &&
    tlsCriticalKeys.some((key) => report.details[key]?.didPass === false)
  ) {
    return CheckResult.Critical;
  }
  return didPass2CheckResult(report.details[key]?.didPass);
};
const ResultGrid: FunctionComponent<Props> = (props) => {
  const { report } = props;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-3 gap-4">
      {(Object.keys(messages) as Array<keyof typeof messages>).map((key) => {
        return (
          <div key={key} className="">
            <div
              className={classNames(
                "bg-deepblue-400 border-2 h-full p-5",
                `border-${checkResult2BorderClassName(
                  didPass2CheckResultWithCritical(key as InspectionType, report)
                )}`
              )}
            >
              <ResultBox
                title={titleMapper[key]}
                description={getDescription(report, key)}
                link={linkMapper[key]}
                checkResult={didPass2CheckResultWithCritical(
                  key as InspectionType,
                  report
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultGrid;
