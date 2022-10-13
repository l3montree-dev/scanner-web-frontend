import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, FunctionComponent, useMemo, useState } from "react";
import Button from "../components/Button";
import Page from "../components/Page";
import ResultBox from "../components/ResultBox";
import { WithId } from "../db/models";
import { IReport } from "../db/report";
import {
  DomainInspectionType,
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
      const obj: WithId<IReport> = await response.json();
      setReport(obj);
      // router.push(obj.id);
    } catch (e) {
      console.log(e);
      setErr("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

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
            OrganizationalInspectionType.ResponsibleDisclosure,
          ] as string[]
        ).includes(key)
      )
      .map((key) => report.result[key as InspectionType])
      .filter((inspection) => inspection.didPass).length;
  }, [report]);

  return (
    <Page>
      <Head>
        <title>OZG Security Challenge 2023</title>
      </Head>
      <div className="flex pb-10 flex-col w-full justify-center">
        <div className="max-w-screen-md mx-auto">
          <div className="md:bg-deepblue-400 mt-10 p-5">
            <h1 className="text-5xl mb-3 text-white font-bold">
              OZG-Security Challenge 2023
            </h1>
            <h2 className="text-white text-2xl">OZG-Security Schnelltest</h2>
            <div className="pb-16">
              <form onSubmit={onSubmit} className="pt-20 flex">
                <input
                  onChange={(e) => setWebsite(e.target.value)}
                  value={website}
                  placeholder="example.com"
                  className="p-5 flex-1 outline-lightning-900 transition-all mr-3"
                />
                <Button
                  loading={loading}
                  type="submit"
                  className="bg-lightning-500 p-3 hover:bg-lightning-900 font-bold transition-all"
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
              IT-Sicherheitsmaßnahmen und Best-Practices durchgeführt werden. Um
              einen Scan zu starten, geben Sie eine Webseite-Domain ein und
              drücken Sie auf den Button “Scan starten”
            </p>
          </div>
          {report !== null && (
            <div className="mt-10 p-5 md:p-0 text-white">
              <h2 className="text-white text-2xl">Testergebnisse</h2>
              <p
                className={classNames(
                  amountPassed === 6 ? "text-lightning-500" : "text-red-500"
                )}
              >
                Bestanden: {amountPassed}/6
              </p>
              <div className="flex-row flex flex-wrap mt-3">
                <div className="md:w-1/3 w-full md:mb-4 mb-8 md:pr-2">
                  <div
                    className={classNames(
                      "bg-deepblue-400 border  h-full p-5",
                      report.result.DNSSec.didPass
                        ? "border-lightning-500"
                        : "border-red-500"
                    )}
                  >
                    <ResultBox
                      title="DNSSEC"
                      description="DNSSEC eingerichtet"
                      didPass={report.result.DNSSec.didPass}
                    />
                  </div>
                </div>
                <div className="md:w-1/3 w-full md:px-2 md:mb-4 mb-8">
                  <div
                    className={classNames(
                      "bg-deepblue-400 border  h-full p-4",
                      report.result.CAA.didPass
                        ? "border-lightning-500"
                        : "border-red-500"
                    )}
                  >
                    <ResultBox
                      title="CAA"
                      description="CAA Einträge konfiguriert"
                      didPass={report.result.CAA.didPass}
                    />
                  </div>
                </div>
                <div className="md:w-1/3 w-full md:pl-2 md:mb-4 mb-8">
                  <div
                    className={classNames(
                      "bg-deepblue-400 border  h-full p-4",
                      report.result.TLSv1_3.didPass
                        ? "border-lightning-500"
                        : "border-red-500"
                    )}
                  >
                    <ResultBox
                      title="TLS 1.3"
                      description="Server unterstützt TLS 1.3"
                      didPass={report.result.TLSv1_3.didPass}
                    />
                  </div>
                </div>
                <div className="md:w-1/3 w-full md:mb-4 mb-8 md:pr-2">
                  <div
                    className={classNames(
                      "bg-deepblue-400 border  h-full p-4",
                      report.result.TLSv1_1_Deactivated.didPass
                        ? "border-lightning-500"
                        : "border-red-500"
                    )}
                  >
                    <ResultBox
                      title="Deaktivierung von veralteten Protokollen"
                      description="TLS 1.1 und älter sowie SSL deaktiviert"
                      didPass={report.result.TLSv1_1_Deactivated.didPass}
                    />
                  </div>
                </div>
                <div className="md:w-1/3 w-full md:mb-4 mb-8 md:px-2">
                  <div
                    className={classNames(
                      "bg-deepblue-400 border  h-full p-4",
                      report.result.HSTS.didPass
                        ? "border-lightning-500"
                        : "border-red-500"
                    )}
                  >
                    <ResultBox
                      title="HSTS"
                      description="HSTS Header vorhanden"
                      didPass={report.result.HSTS.didPass}
                    />
                  </div>
                </div>
                <div className="md:w-1/3 w-full md:mb-4 mb-8 md:pl-2">
                  <div
                    className={classNames(
                      "bg-deepblue-400 border  h-full p-4",
                      report.result.ResponsibleDisclosure.didPass
                        ? "border-lightning-500"
                        : "border-red-500"
                    )}
                  >
                    <ResultBox
                      title="Responsible Disclosure"
                      description={`${report.fqdn}/.well-known/security.txt vorhanden`}
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
