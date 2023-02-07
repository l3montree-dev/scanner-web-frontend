import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";
import { DetailedDomain } from "../types";
import { classNames } from "../utils/common";
import ResultGrid from "./ResultGrid";

interface Props {
  domain: DetailedDomain | null;
  dateString: string;
  handleRefresh: () => Promise<void>;
  refreshRequest: {
    loading: (key?: string) => void;
    success: () => void;
    error: (err: string, key?: string) => void;
    isLoading: boolean;
    errorMessage: string;
    errored: boolean;
    key: string;
    successed: boolean;
  };
  amountPassed: number;
}

const ResultEnvelope: FunctionComponent<Props> = ({
  domain,
  dateString,
  handleRefresh,
  refreshRequest,
  amountPassed,
}) => {
  return domain !== null ? (
    <div className="mt-10 p-5 md:p-0 text-white">
      <h2 id="test-results" className="text-white text-2xl">
        Testergebnisse für{" "}
        <a
          target={"_blank"}
          className="underline"
          rel="noopener noreferrer"
          href={`//${domain.fqdn}`}
        >
          {domain.fqdn}{" "}
        </a>
      </h2>
      {domain.fqdn !== domain.details.sut && (
        <>
          Weiterleitung auf:{" "}
          <a
            target={"_blank"}
            className="underline"
            rel="noopener noreferrer"
            href={`//${domain.details.sut}`}
          >
            {domain.details.sut}
          </a>
        </>
      )}
      <div className="flex items-center mt-4 flex-row">
        <p>{dateString.substring(0, dateString.length - 3)}</p>
        <button
          onClick={handleRefresh}
          title="Testergebnisse aktualisieren"
          className={classNames("ml-2 bg-deepblue-200 w-8 h-8")}
        >
          <FontAwesomeIcon
            className={refreshRequest.isLoading ? "rotate" : ""}
            icon={faRefresh}
          />
        </button>
      </div>

      {refreshRequest.errored && (
        <p className={classNames("text-red-500")}>
          {refreshRequest.errorMessage}
        </p>
      )}
      {!refreshRequest.isLoading && !refreshRequest.errored && (
        <div>
          <p>Erfüllt: {amountPassed}/6</p>
          <ResultGrid report={domain} />
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};

export default ResultEnvelope;
