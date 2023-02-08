import type { GetServerSideProps, NextPage } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Meta from "../components/Meta";
import Page from "../components/Page";
import useLoading from "../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  InspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";

import ReleasePlaceHolder from "../components/ReleasePlaceholder";
import ResultEnvelope from "../components/ResultEnvelope";
import ScanPageHero from "../components/ScanPageHero";
import { clientHttpClient } from "../services/clientHttpClient";
import { DetailedDomain, IScanSuccessResponse } from "../types";
import { sanitizeFQDN } from "../utils/common";
import Subscribe from "../components/Subscribe";
import PrimaryButton from "../components/PrimaryButton";

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
    const target = sanitizeFQDN(website);
    if (!target) {
      scanRequest.error("Bitte trage einen gültigen Domainnamen ein.");
      return;
    }
    // react will batch those two calls anyways.
    scanRequest.loading();
    setDomain(null);

    // do the real api call.
    try {
      const response = await clientHttpClient(
        `/api/scan?site=${encodeURIComponent(target)}`,
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
      console.log(rec);
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
        `/api/scan?site=${encodeURIComponent(domain.fqdn)}&refresh=true`,
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
        <ReleasePlaceHolder />
      </Page>
    );
  }
  return (
    <Page>
      <Meta />
      <div className="flex md:py-10 flex-col w-full justify-center">
        <div className="max-w-screen-lg w-full md:p-5 mx-auto">
          <ScanPageHero
            onSubmit={onSubmit}
            setWebsite={setWebsite}
            website={website}
            scanRequest={scanRequest}
          />
          <ResultEnvelope
            domain={domain}
            dateString={dateString}
            handleRefresh={handleRefresh}
            refreshRequest={refreshRequest}
            amountPassed={amountPassed}
          />
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  // check if the user does provide a valid query parameter
  const code = query["s"];
  if (
    /*context.req.headers.host === "localhost:3000"*/ false ||
    (code && (+code === 423333 || +code % 42 === 0))
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
