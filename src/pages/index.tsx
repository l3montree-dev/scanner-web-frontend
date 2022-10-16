import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FormEvent,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Button from "../components/Button";
import Page from "../components/Page";
import ResultBox from "../components/ResultBox";
import { WithId } from "../db/models";
import { IReport } from "../db/report";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/Inspector";
import { clientHttpClient } from "../services/clientHttpClient";

import { sanitizeFQDN } from "../utils/santize";
import { classNames } from "../utils/style-utils";

const hostnameRegex = new RegExp(
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

const borderClass = (didPass: boolean | null) => {
  return didPass === null
    ? "border-white"
    : didPass
    ? "border-lightning-500"
    : "border-red-500";
};

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

const Home: NextPage = () => {
  const [website, setWebsite] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<null | IReport>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // test if valid url
    const fqdn = sanitizeFQDN(website);
    if (!fqdn || !hostnameRegex.test(fqdn)) {
      setErr("Bitte trage einen gültigen Domainnamen ein.");
      return;
    }
    // react will batch those two calls anyways.
    setLoading(true);
    setErr("");
    setReport(null);

    // do the real api call.
    try {
      const response = await clientHttpClient(
        `/api/scan?site=${fqdn}`,
        crypto.randomUUID()
      );

      if (!response.ok) {
        if (response.status === 400) {
          return setErr("Die Domain konnte nicht gefunden werden.");
        }
        return setErr(
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
        );
      }

      const obj: WithId<IReport> = await response.json();
      setReport(obj);
      // scroll to the result box.

      // router.push(obj.id);
    } catch (e) {
      setErr("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report) {
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
  }, [report]);

  const amountPassed = useMemo(() => {
    if (!report) return 0;
    return Object.keys(report.result)
      .filter((key) =>
        (
          [
            TLSInspectionType.TLSv1_3,
            TLSInspectionType.TLSv1_1_Deactivated,
            DomainInspectionType.CAA,
            DomainInspectionType.DNSSec,
            HeaderInspectionType.HSTS,
            OrganizationalInspectionType.ResponsibleDisclosure,
          ] as string[]
        ).includes(key)
      )
      .map((key) => report.result[key as InspectionType])
      .filter((inspection) => inspection.didPass).length;
  }, [report]);

  const dateString = report ? new Date(report.createdAt).toLocaleString() : "";
  return (
    <Page>
      <Head>
        <title>OZG Security Challenge 2023</title>
        <meta
          name="description"
          content="OZG Security Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices"
        />
        <meta name="title" content="OZG Security Schnelltest einer Webseite" />
        <meta
          name="keywords"
          content="OZG, Security, IT-Security, Schnelltest, IT-Sicherheit, Onlinezugangsgesetz, Security-Challenge, OZG Security-Challenge 2023, Best-Practices, Website Scan"
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ozgsec.de/" />
        <meta property="og:title" content="OZG Security Challenge 2023" />
        <meta
          property="og:description"
          content="OZG Security Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ozgsec.de/" />
        <meta property="twitter:title" content="OZG Security Challenge 2023" />
        <meta
          property="twitter:description"
          content="OZG Security Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices"
        />
        <link
          rel="preload"
          href="/assets/fonts/BundesSansWeb-Bold.woff"
          as="font"
          type="font/woff"
        ></link>
        <link
          rel="preload"
          href="/assets/fonts/BundesSansWeb-Regular.woff"
          as="font"
          type="font/woff"
        ></link>
      </Head>
      <div className="flex pb-10 flex-col w-full justify-center">
        <div className="max-w-screen-lg w-full md:p-5 mx-auto">
          <div className="md:bg-deepblue-400 md:mt-0 mt-10 md:p-10 p-5">
            <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
              <h1 className="text-5xl sm:order-1 order-2 mb-3 text-white font-bold">
                OZG Security Challenge 2023
              </h1>
              <div className="p-2 mb-4 sm:mb-0 order-1 bg-deepblue-200">
                <span className="text-white">BETA</span>
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
                  loading={loading}
                  type="submit"
                  className="bg-lightning-500 text-sm sm:text-base p-2 sm:p-3 hover:bg-lightning-900 font-bold transition-all"
                >
                  Scan starten
                </Button>
              </form>

              {err !== "" && (
                <small className="text-red-600 absolute mt-3 block">
                  {err}
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
              <h2 id="test-results" className="text-white text-2xl">
                Testergebnisse für{" "}
                <a
                  target={"_blank"}
                  className="underline"
                  rel="noopener noreferrer"
                  href={`//${report.fqdn}`}
                >
                  {report.fqdn}
                </a>
              </h2>
              <p>{dateString.substring(0, dateString.length - 3)}</p>
              <p
                className={classNames(
                  amountPassed === 6 ? "text-lightning-500" : "text-red-500"
                )}
              >
                Bestanden: {amountPassed}/6
              </p>
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
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default Home;

interface TableProps {
  data: Record<string, any>;
}
const Table: FunctionComponent<TableProps> = (props) => {
  const { data } = props;
  return (
    <div>
      {Object.entries(data).map(([key, value]: any) => {
        return (
          <div key={key} className="justify-between">
            <span className="w-1/3 mr-4">{key}</span>
            {!!value && typeof value !== "object" && (
              <div className="bg-deepblue-600 break-all mt-4 flex-1 text-white p-4">
                {value}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
