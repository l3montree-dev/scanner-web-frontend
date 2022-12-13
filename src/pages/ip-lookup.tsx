import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import { FormEvent, useEffect, useState } from "react";
import Button from "../components/Button";
import Meta from "../components/Meta";
import Page from "../components/Page";
import useLoading from "../hooks/useLoading";
import { IIpLookupProgressUpdateDTO, IIpLookupReportDTO } from "../types";

import { socket } from "../services/socketClient";
import { classNames, isProgressMessage } from "../utils/common";

import Progressbar from "../components/Progressbar";

const cidrRegex = new RegExp(
  /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/
);

const IPLookup: NextPage = () => {
  const [cidr, setCidr] = useState("");
  const scanRequest = useLoading();
  const refreshRequest = useLoading();
  const [report, setReport] = useState<
    null | IIpLookupReportDTO | IIpLookupProgressUpdateDTO
  >(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!cidr || !cidrRegex.test(cidr)) {
      scanRequest.error("Es handelt sich nicht um eine gültige CIDR-Notation.");
      return;
    }
    // react will batch those two calls anyways.
    scanRequest.loading();
    setReport(null);

    const timeout = setTimeout(() => {
      scanRequest.error(
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      );
    }, 10000);

    // listen for updates.
    socket.on(
      "ip-lookup",
      (data: IIpLookupReportDTO | IIpLookupProgressUpdateDTO) => {
        clearTimeout(timeout);
        setReport(data);
        if (!isProgressMessage(data)) {
          console.log("finished ip-lookup, removing listeners");
          socket.removeAllListeners("ip-lookup");
          scanRequest.success();
        }
      }
    );

    if (socket.connected) {
      socket.emit("ip-lookup", { cidr, requestId: crypto.randomUUID() });
    } else {
      socket.on("connect", () => {
        socket.emit("ip-lookup", { cidr, requestId: crypto.randomUUID() });
      });
      socket.connect();
    }
  };

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Page>
      <Meta />
      <div className="flex md:py-10 flex-col w-full justify-center">
        <div className="max-w-screen-lg w-full md:p-5 mx-auto">
          <div className="md:bg-deepblue-400 md:mt-0 mt-10 md:p-10 p-5">
            <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
              <h1 className="text-5xl sm:order-1 order-2 mb-3 text-white font-bold">
                OZG Security Challenge 2023
              </h1>
              <div className="p-2 mb-4 sm:mb-0 order-1 bg-deepblue-200">
                <span className="text-white whitespace-nowrap">BETA</span>
              </div>
            </div>
            <h2 className="text-white text-2xl">OZG Security Schnelltest</h2>
            <div className="pb-14">
              <form onSubmit={onSubmit} className="pt-10  flex">
                <input
                  onChange={(e) => setCidr(e.target.value)}
                  value={cidr}
                  placeholder="45.10.26.0/24"
                  className="sm:p-5 p-4 text-sm sm:text-base flex-1 outline-lightning-900 transition-all mr-3"
                />
                <Button
                  loading={scanRequest.isLoading}
                  type="submit"
                  className="bg-lightning-500 text-sm sm:text-base p-2 sm:p-3 hover:bg-lightning-900 font-bold leading-4 transition-all"
                >
                  Scan starten
                </Button>
              </form>

              {scanRequest.errored && (
                <small className="text-red-600 absolute mt-3 block">
                  {scanRequest.errorMessage}
                </small>
              )}
            </div>
            <p className="text-white">
              Mit diesem Tool kann ein Schnelltest einer Webseite in Bezug auf
              ausgewählte IT-Sicherheitsmaßnahmen und Best-Practices
              durchgeführt werden. Um einen Scan zu starten, geben Sie eine
              Webseite-Domain ein und drücken Sie auf den Button „Scan starten“
            </p>
          </div>

          {report !== null && (
            <div className="mt-10 p-5 md:p-0 text-white">
              <div className="flex justify-between flex-row">
                <div>
                  <h2 id="test-results" className="text-white text-2xl">
                    Testergebnisse für {report.cidr}
                  </h2>
                  <span>Gefundene DNS Einträge: {report.results.length}</span>
                </div>
                {isProgressMessage(report) && (
                  <div className="text-white text-right w-52">
                    <Progressbar
                      progress={Math.max(0, report.processed / report.queued)}
                    />
                    Warteschlangengrösse:{" "}
                    <span className="font-bold">
                      {report.processed}/{report.queued}
                    </span>
                  </div>
                )}
              </div>
              {refreshRequest.errored && (
                <p className={classNames("text-red-500")}>
                  {refreshRequest.errorMessage}
                </p>
              )}
              {!refreshRequest.isLoading && !refreshRequest.errored && (
                <div className="mt-10">
                  {report.results.map(({ ip, domain }) => (
                    <div
                      key={ip + domain}
                      className="mt-2 flex border-b border-b-deepblue-200 flex-row items-center"
                    >
                      <div className="flex flex-1 flex-wrap">
                        {domain}
                        <a
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          href={`//${domain}`}
                        >
                          <FontAwesomeIcon
                            className="ml-2 cursor-pointer"
                            icon={faArrowUpRightFromSquare}
                          />
                        </a>
                      </div>
                      <span className="font-bold flex-1 text-left mr-5">
                        {ip}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default IPLookup;
