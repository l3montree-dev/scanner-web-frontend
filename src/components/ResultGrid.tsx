import React, { FunctionComponent } from "react";
import { IReport } from "../db/report";
import { classNames } from "../utils/style-utils";
import ResultBox from "./ResultBox";

const borderClass = (didPass: boolean | null) => {
  return didPass === null
    ? "border-white"
    : didPass
    ? "border-lightning-500"
    : "border-red-500";
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
            "bg-deepblue-400 border  h-full p-5",
            borderClass(report.result.DNSSec.didPass)
          )}
        >
          <ResultBox
            title="DNSSEC"
            description={
              report.result.DNSSec.didPass !== null
                ? `DNSSEC ist für die Domain ${report.fqdn} eingerichtet.`
                : `DNSSEC konnte für die Domain ${report.fqdn} nicht überprüft werden.`
            }
            didPass={report.result.DNSSec.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full sm:pl-2 md:px-2 md:mb-4 mb-5">
        <div
          className={classNames(
            "bg-deepblue-400 border  h-full p-4",
            borderClass(report.result.CAA.didPass)
          )}
        >
          <ResultBox
            title="CAA"
            description={
              report.result.CAA.didPass !== null
                ? `CAA Einträge sind für die Domain ${report.fqdn} eingerichtet.`
                : `Die Überprüfung nach CAA Einträgen für die Domain ${report.fqdn} konnte nicht durchgeführt werden.`
            }
            didPass={report.result.CAA.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full sm:pr-2 md:pr-0 md:pl-2 md:mb-4 mb-5">
        <div
          className={classNames(
            "bg-deepblue-400 border  h-full p-4",
            borderClass(report.result.TLSv1_3.didPass)
          )}
        >
          <ResultBox
            title="TLS 1.3"
            description={
              report.result.TLSv1_3.didPass !== null
                ? "Der Server unterstützt das Protokoll TLS 1.3."
                : "Die Überprüfung nach TLS 1.3 konnte nicht durchgeführt werden."
            }
            didPass={report.result.TLSv1_3.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full md:mb-4 mb-5 sm:pl-2 md:pl-0 md:pr-2">
        <div
          className={classNames(
            "bg-deepblue-400 border  h-full p-4",
            borderClass(report.result.TLSv1_1_Deactivated.didPass)
          )}
        >
          <ResultBox
            title="Deaktivierung von veralteten TLS/ SSL Protokollen"
            description={
              report.result.TLSv1_1_Deactivated.didPass !== null
                ? "TLS 1.1 und älter sowie SSL sind deaktiviert."
                : "Die Deaktivierung von TLS 1.1 und älter sowie SSL konnte nicht überprüft werden."
            }
            didPass={report.result.TLSv1_1_Deactivated.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full sm:pr-2 md:mb-4 mb-5 md:px-2">
        <div
          className={classNames(
            "bg-deepblue-400 border  h-full p-4",
            borderClass(report.result.HSTS.didPass)
          )}
        >
          <ResultBox
            title="HSTS"
            description={
              report.result.HSTS.didPass !== null
                ? "Strict-Transport-Security Header vorhanden und korrekt konfiguriert."
                : "Strict-Transport-Security Header konnte nicht überprüft werden."
            }
            didPass={report.result.HSTS.didPass}
          />
        </div>
      </div>
      <div className="md:w-1/3 sm:w-1/2 w-full md:mb-4 mb-5 sm:pl-2">
        <div
          className={classNames(
            "bg-deepblue-400 border  h-full p-4",
            borderClass(report.result.ResponsibleDisclosure.didPass)
          )}
        >
          <ResultBox
            title="Responsible Disclosure"
            description={
              report.result.ResponsibleDisclosure.didPass !== null
                ? `Die Datei ${report.fqdn}/.well-known/security.txt ist vorhanden und enthält die nötigen Einträge.`
                : `Die Datei ${report.fqdn}/.well-known/security.txt konnte nicht überprüft werden.`
            }
            didPass={report.result.ResponsibleDisclosure.didPass}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultGrid;
