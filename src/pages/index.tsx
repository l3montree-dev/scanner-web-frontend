import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, FunctionComponent, useState } from "react";
import Button from "../components/Button";
import Page from "../components/Page";
import { WithId } from "../db/models";
import { IReport } from "../db/report";
import { clientHttpClient } from "../services/clientHttpClient";

import { sanitizeFQDN } from "../utils/santize";

const hostnameRegex = new RegExp(
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
);

const Home: NextPage = () => {
  const [website, setWebsite] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    // do the real api call.
    try {
      const response = await clientHttpClient(`/api/scan?site=${fqdn}`);
      const obj: WithId<IReport> = await response.json();
      router.push(obj.id);
    } catch (e) {
      console.log(e);
      setErr("Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Head>
        <title>OZGSec</title>
      </Head>
      <div className="flex flex-col w-full justify-center">
        <div className="max-w-screen-sm mx-auto">
          <div className="md:bg-deepblue-400 mt-10 p-10">
            <h1 className="text-5xl mb-3 text-white font-bold">OZGSec</h1>
            <h2 className="text-white text-2xl">Webseiten Scanner</h2>
            <div className="pb-16">
              <form onSubmit={onSubmit} className="pt-20 flex">
                <input
                  onChange={(e) => setWebsite(e.target.value)}
                  value={website}
                  placeholder="verwaltung.bund.de"
                  className="p-5 flex-1 outline-lightning-900 transition-all mr-3"
                />
                <Button
                  loading={loading}
                  type="submit"
                  className="bg-lightning-500 p-3 font-medium hover:bg-lightning-900 transition-all"
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
              Mit diesem Tool kann ein Scan einer Webseite in Bezug auf
              IT-Sicherheitsmaßnahmen und Best-Practices durchgeführt werden. Um
              einen Scan zu starten, geben Sie eine Webseite-Domain ein und
              drücken auf den Button “Scan starten”
            </p>
          </div>
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
