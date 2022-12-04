import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import { FormEvent, useEffect, useState } from "react";
import Button from "../components/Button";
import Meta from "../components/Meta";
import Page from "../components/Page";
import useLoading from "../hooks/useLoading";
import { IIpLookupProgressUpdate, IIpLookupReport } from "../types";

import { socket } from "../services/socketClient";
import { isProgressMessage } from "../utils/common";

import Progressbar from "../components/Progressbar";
import { classNames } from "../utils/style-utils";

const cidrRegex = new RegExp(
  /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/
);

const isInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

const IPLookup: NextPage = () => {
  const [cidr, setCidr] = useState("");
  const scanRequest = useLoading();
  const refreshRequest = useLoading();
  const [report, setReport] = useState<
    null | IIpLookupProgressUpdate | IIpLookupReport
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
      (data: IIpLookupReport | IIpLookupProgressUpdate) => {
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
                <h2 id="test-results" className="text-white text-2xl">
                  Testergebnisse für {report.cidr}
                </h2>
                {isProgressMessage(report) && (
                  <div className="text-white text-right w-52">
                    <Progressbar
                      progress={Math.max(0, (50 - report.queued) / 50)}
                    />
                    Warteschlangengrösse:{" "}
                    <span className="font-bold">{report.queued}</span>
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
                  {Object.entries(report.results).map(([ip, result]) => (
                    <div key={ip} className="mt-2 flex flex-row items-center">
                      <h3 className="text-xl font-bold w-28 text-right mr-5">
                        {ip}
                      </h3>
                      <div className="flex flex-1 flex-wrap">
                        {result.map((domain) => (
                          <div
                            key={domain}
                            className="p-2 bg-deepblue-200 mt-2 rounded-md mr-2"
                          >
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
                        ))}
                      </div>
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
