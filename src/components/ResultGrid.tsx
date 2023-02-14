import { FunctionComponent } from "react";
import {
  CertificateInspectionType,
  DomainInspectionType,
  HeaderInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { getDNSSecReportMessage } from "../messages/dnsSec";
import { getHSTSReportMessage } from "../messages/hsts";
import { getMatchesHostnameMessage } from "../messages/matchesHostname";
import { getResponsibleDisclosureReportMessage } from "../messages/responsibleDisclosure";
import getRPKIReportMessage from "../messages/rpki";
import { getTLSv1_1_DeactivatedReportMessage } from "../messages/tlsv1_1_Deactivated";
import { getTLSv1_3ReportMessage } from "../messages/tlsv1_3";
import { getValidCertificateMessage } from "../messages/validCertificate";
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
  MatchesHostname: getMatchesHostnameMessage,
  ValidCertificate: getValidCertificateMessage,
};

const regularChecks = [
  OrganizationalInspectionType.ResponsibleDisclosure,
  TLSInspectionType.TLSv1_3,
  TLSInspectionType.TLSv1_1_Deactivated,
  HeaderInspectionType.HSTS,
  DomainInspectionType.DNSSec,
  NetworkInspectionType.RPKI,
] as const;

const immediateActionRequired = [
  CertificateInspectionType.MatchesHostname,
  CertificateInspectionType.ValidCertificate,
] as const;

const titleMapper = {
  DNSSec: "DNSSEC",
  RPKI: "RPKI",
  TLSv1_3: "TLS 1.3",
  TLSv1_1_Deactivated: "Deaktivierung von veralteten TLS/ SSL Protokollen",
  HSTS: "HSTS",
  ResponsibleDisclosure: "Responsible Disclosure",
  MatchesHostname: "Übereinstimmung des Hostnamens im Zertifikat",
  ValidCertificate: "Gültiges Zertifikat",
};

const getDescription = (
  report: DetailedDomain,
  key: keyof typeof messages
): string => {
  return messages[key](report);
};
interface Props {
  report: DetailedDomain;
}

const ResultGrid: FunctionComponent<Props> = (props) => {
  const { report } = props;

  const immediateActionRequiredChecks = immediateActionRequired.filter(
    (check) => report.details[check]?.didPass === false
  );
  return (
    <>
      {immediateActionRequiredChecks.length > 0 && (
        <div className="mt-3 mb-4 flex flex-wrap flex-row gap-4">
          {immediateActionRequiredChecks.map((key) => {
            return (
              <div key={key} className="w-full flex-none sm:flex-1">
                <div
                  className={classNames(
                    "bg-deepblue-400 border-2 h-full p-5",
                    `border-${checkResult2BorderClassName(
                      CheckResult.Critical
                    )}`
                  )}
                >
                  <ResultBox
                    title={titleMapper[key]}
                    description={getDescription(report, key)}
                    link={linkMapper[key]}
                    checkResult={CheckResult.Critical}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-3 gap-4">
        {regularChecks.map((key) => {
          return (
            <div key={key} className="">
              <div
                className={classNames(
                  "bg-deepblue-400 border-2 h-full p-5",
                  `border-${checkResult2BorderClassName(
                    didPass2CheckResult(report.details[key]?.didPass)
                  )}`
                )}
              >
                <ResultBox
                  title={titleMapper[key]}
                  description={getDescription(report, key)}
                  link={linkMapper[key]}
                  checkResult={didPass2CheckResult(
                    report.details[key]?.didPass
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ResultGrid;
