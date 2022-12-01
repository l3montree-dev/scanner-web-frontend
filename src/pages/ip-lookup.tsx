import {
  faArrowUpRightFromSquare,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import Meta from "../components/Meta";
import Page from "../components/Page";
import ResultGrid from "../components/ResultGrid";
import {
  IDetailedReport,
  IIpLookupProgressUpdate,
  IIpLookupReport,
} from "../types";
import useLoading from "../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";

import { clientHttpClient } from "../services/clientHttpClient";
import { socket } from "../services/socketClient";
import { isProgressMessage } from "../utils/common";

import { classNames } from "../utils/style-utils";
import Progressbar from "../components/Progressbar";

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
  >({
    queued: 6,
    results: {
      "45.10.0.1": ["dus1.core.as209859.net", "core.as209859.net"],
      "45.10.0.113": ["gw.telephony.esser.io"],
      "45.10.0.116": ["cnf.telephony.esser.io"],
      "45.10.0.117": ["dect.telephony.esser.io", "telephony.esser.io"],
      "45.10.0.118": ["pbx.telephony.esser.io"],
      "45.10.0.126": ["p126.telephony.esser.io", "esser.io"],
      "45.10.0.129": ["vlan128.florianesser.koeln", "florianesser.koeln"],
      "45.10.0.131": ["otzenrath.florianesser.koeln"],
      "45.10.0.140": ["dns.florianesser.koeln"],
      "45.10.0.161": ["tun-0001.dus.fesr.net", "dus.fesr.net"],
      "45.10.0.2": ["dus2.core.as209859.net"],
      "45.10.0.225": ["rt01.ohs.scix.cc", "ohs.scix.cc", "scix.cc"],
      "45.10.0.25": ["mail.esser.io"],
      "45.10.0.27": ["lists.femx.de", "femx.de"],
      "45.10.0.28": ["mailcow.fesr.email", "fesr.email"],
      "45.10.0.30": [
        "vlan25.iapetos.hznr.fesr.net",
        "iapetos.hznr.fesr.net",
        "hznr.fesr.net",
        "fesr.net",
      ],
      "45.10.0.5": ["fra2.core.as209859.net"],
      "45.10.0.53": ["dns.as209859.net", "as209859.net"],
    },
    requestId: "2876a6aa-d355-4bba-8d3d-de1a7d012e4e",
    cidr: "45.10.0.0/24",
  });

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
    socket.on("ip-lookup", (data) => {
      clearTimeout(timeout);
      setReport(data);
      if (!isProgressMessage(data)) {
        console.log("finished ip-lookup, removing listeners");
        socket.removeAllListeners("ip-lookup");
        scanRequest.success();
      }
    });

    socket.on("connect", () => {
      socket.emit("ip-lookup", { cidr, requestId: crypto.randomUUID() });
    });
    socket.connect();
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
                  <div className="text-white w-52">
                    <Progressbar progress={(100 - report.queued) / 100} />
                    Warteschlangengrö{report.queued}
                  </div>
                )}
              </div>
              {refreshRequest.errored && (
                <p className={classNames("text-red-500")}>
                  {refreshRequest.errorMessage}
                </p>
              )}
              {!refreshRequest.isLoading && !refreshRequest.errored && (
                <div>
                  {Object.entries(report.results).map(([ip, result]) => (
                    <div key={ip} className="mt-2 flex flex-row items-center">
                      <h3 className="text-xl font-bold w-28 text-right mr-5">
                        {ip}
                      </h3>
                      <div className="flex flex-wrap">
                        {result.map((domain) => (
                          <div
                            key={domain}
                            className="p-2 bg-deepblue-200 rounded-md mr-2"
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
