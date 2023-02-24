import { FunctionComponent } from "react";
import {
  CertificateInspectionType,
  DomainInspectionType,
  HeaderInspectionType,
  HttpInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { getDNSSecReportMessage } from "../messages/dnsSec";
import { getHSTSReportMessage } from "../messages/hsts";
import { getHttpMessage, immediateActionHTTPErrors } from "../messages/http";
import { getMatchesHostnameMessage } from "../messages/matchesHostname";
import { getResponsibleDisclosureReportMessage } from "../messages/responsibleDisclosure";
import getRPKIReportMessage from "../messages/rpki";
import { getTLSv1_1_DeactivatedReportMessage } from "../messages/tlsv1_1_Deactivated";
import { getTLSv1_3ReportMessage } from "../messages/tlsv1_3";
import { getValidCertificateMessage } from "../messages/validCertificate";
import { DetailedTarget } from "../types";
import { classNames, devOnly, linkMapper } from "../utils/common";
import {
  CheckResult,
  checkResult2BorderClassName,
  didPass2CheckResult,
} from "../utils/view";

import ResultBox from "./ResultBox";

const messages = {
  responsibleDisclosure: getResponsibleDisclosureReportMessage,
  tlsv1_3: getTLSv1_3ReportMessage,
  tlsv1_1_Deactivated: getTLSv1_1_DeactivatedReportMessage,
  hsts: getHSTSReportMessage,
  dnsSec: getDNSSecReportMessage,
  rpki: getRPKIReportMessage,
  matchesHostname: getMatchesHostnameMessage,
  validCertificate: getValidCertificateMessage,
  http: getHttpMessage,
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
  HttpInspectionType.HTTP,
] as const;

const titleMapper = {
  dnsSec: "DNSSEC",
  rpki: "RPKI",
  tlsv1_3: "TLS 1.3",
  http: "HTTP",
  tlsv1_1_Deactivated: "Deaktivierung von veralteten TLS/ SSL Protokollen",
  hsts: "HSTS",
  responsibleDisclosure: "Responsible Disclosure",
  matchesHostname: "Übereinstimmung des Hostnamens im Zertifikat",
  validCertificate: "Gültiges Zertifikat",
};

type ImmediateActions = typeof immediateActionRequired;

const shouldDisplayImmediateActionRequired = (
  report: DetailedTarget,
  check: ImmediateActions[number]
): boolean => {
  if (check === HttpInspectionType.HTTP) {
    return (
      report.details[check]?.didPass === null &&
      immediateActionHTTPErrors.includes(
        report.details[check]?.actualValue.error.code
      )
    );
  }
  return report.details[check]?.didPass === false;
};

const getDescription = (
  report: DetailedTarget,
  key: keyof typeof messages
): string => {
  return messages[key](report);
};
interface Props {
  report: DetailedTarget;
}

const ResultGrid: FunctionComponent<Props> = (props) => {
  const { report } = props;

  const immediateActionRequiredChecks = immediateActionRequired.filter((key) =>
    shouldDisplayImmediateActionRequired(report, key)
  );
  return (
    <>
      {devOnly(() => (
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
        </>
      ))}
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
