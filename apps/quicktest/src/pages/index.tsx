import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { GetServerSideProps, NextPage } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import Meta from "../components/Meta";
import Page from "../components/Page";
import ResultGrid from "../components/ResultGrid";
import useLoading from "../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";

import { clientHttpClient } from "../services/clientHttpClient";
import { DetailedDomain, IScanSuccessResponse } from "../types";
import { classNames, sanitizeFQDN } from "../utils/common";

const hostnameRegex = new RegExp(
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
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

interface Props {
  displayNotAvailable: boolean;
}
const Home: NextPage<Props> = ({ displayNotAvailable }) => {
  const [website, setWebsite] = useState("");
  const scanRequest = useLoading();
  const refreshRequest = useLoading();
  const [domain, setDomain] = useState<null | DetailedDomain>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // test if valid url
    const fqdn = sanitizeFQDN(website);
    if (!fqdn || !hostnameRegex.test(fqdn)) {
      scanRequest.error("Bitte trage einen gültigen Domainnamen ein.");
      return;
    }
    // react will batch those two calls anyways.
    scanRequest.loading();
    setDomain(null);

    // do the real api call.
    try {
      const response = await clientHttpClient(
        `/api/scan?site=${fqdn}`,
        crypto.randomUUID()
      );

      if (!response.ok) {
        if (response.status === 400) {
          return scanRequest.error("Die Domain konnte nicht gefunden werden.");
        }
        return scanRequest.error(
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
        );
      }

      const obj: DetailedDomain = await response.json();
      setDomain(obj);
      scanRequest.success();
    } catch (e) {
      scanRequest.error(
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      );
    }
  };

  useEffect(() => {
    if (domain) {
      const rec = document.getElementById("test-results");

      if (rec && !isInViewport(rec)) {
        window.scrollTo({
          top:
            rec.getBoundingClientRect().top +
            window.scrollY -
            window.innerHeight / 16,
          behavior: "smooth",
        });
      }
    }
  }, [domain]);

  const handleRefresh = async () => {
    if (!domain) {
      return;
    }
    refreshRequest.loading();
    try {
      const response = await clientHttpClient(
        `/api/scan?site=${domain.fqdn}&refresh=true`,
        crypto.randomUUID()
      );
      if (!response.ok) {
        if (response.status === 400) {
          return refreshRequest.error(
            "Die Domain konnte nicht gefunden werden."
          );
        }
        return refreshRequest.error(
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
        );
      }
      const obj = await response.json();
      setDomain(obj);
      refreshRequest.success();
    } catch (e) {
      refreshRequest.error(
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      );
    }
  };

  const amountPassed = useMemo(() => {
    if (!domain) return 0;
    return Object.keys(domain.details as Record<string, any>)
      .filter((key) =>
        (
          [
            TLSInspectionType.TLSv1_3,
            TLSInspectionType.TLSv1_1_Deactivated,
            NetworkInspectionType.RPKI,
            DomainInspectionType.DNSSec,
            HeaderInspectionType.HSTS,
            OrganizationalInspectionType.ResponsibleDisclosure,
          ] as string[]
        ).includes(key)
      )
      .map(
        (key) =>
          (domain.details as IScanSuccessResponse["result"])[
            key as InspectionType
          ]?.didPass
      )
      .filter((inspection) => !!inspection).length;
  }, [domain]);

  const dateString = domain
    ? new Date(Number(domain.lastScan)).toLocaleString()
    : "";

  if (displayNotAvailable) {
    return (
      <Page hideLogin>
        <Meta />
        <div className="flex md:py-10 flex-col w-full justify-center">
          <div className="max-w-screen-lg w-full md:p-5 mx-auto">
            <div className="md:mt-0 mt-10 md:p-10 text-white text-center p-5">
              <h1 className="text-5xl sm:order-1 order-2 mb-3 font-bold">
                OZG Security Challenge 2023
              </h1>
              <p className="text-white text-xl mt-10">
                Hier entsteht ein Schnelltest einer Webseite in Bezug auf
                ausgewählte IT-Sicherheitsmaßnahmen und Best-Practices.
              </p>
            </div>
          </div>
        </div>
      </Page>
    );
  }
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
                  onChange={(e) => setWebsite(e.target.value)}
                  value={website}
                  placeholder="example.com"
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

          {domain !== null && (
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
                  <p>Bestanden: {amountPassed}/6</p>
                  <ResultGrid report={domain} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  // check if the user does provide a valid query parameter
  const date = new Date();
  const code = query["s"];
  if (
    code &&
    (+code === 423333 ||
      (+code % 42 === 0 &&
        date.getMonth() === 0 &&
        date.getDate() >= 24 &&
        date.getDate() <= 25))
  ) {
    return {
      props: {
        displayNotAvailable: false,
      },
    };
  }
  return {
    props: {
      displayNotAvailable: true,
    },
  };
};

export default Home;
