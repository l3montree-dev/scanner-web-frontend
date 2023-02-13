import {
  faCheck,
  faCross,
  faRefresh,
  faTimes,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";
import Subscribe from "../pages/api/subscribe";
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
      <div className="md:flex block mb-5 gap-5 flex-row justify-between">
        <div className="md:w-2/3">
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
          <div className="flex-wrap mt-4 justify-between flex-row">
            <div className="flex-1">
              <div className="flex flex-row">
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
              <p>Erfüllt: {amountPassed}/6</p>
            </div>
          </div>
        </div>

        <div className="bg-deepblue-400 md:w-1/3 mt-5 md:mt-0 p-4 text-white">
          <div className="flex-row flex items-center">
            <FontAwesomeIcon
              className="text-lightning-500 text-2xl w-6"
              icon={faCheck}
            />
            <span className="ml-4">Maßnahme umgesetzt</span>
          </div>
          <div className="flex-row flex mt-2 items-center">
            <FontAwesomeIcon
              className="text-yellow-500 text-2xl w-6"
              icon={faWarning}
            />
            <span className="ml-4">Maßnahme nicht umgesetzt</span>
          </div>
          <div className="flex-row flex mt-2 items-center">
            <div className="w-6">
              <FontAwesomeIcon
                className="text-red-500 text-2xl w-6"
                icon={faTimes}
              />
            </div>
            <span className="ml-4">Fehlerhafte Umsetzung</span>
          </div>
        </div>

        {refreshRequest.errored && (
          <p className={classNames("text-red-500")}>
            {refreshRequest.errorMessage}
          </p>
        )}
      </div>
      {!refreshRequest.isLoading && !refreshRequest.errored && (
        <div>
          <ResultGrid report={domain} />
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};

export default ResultEnvelope;