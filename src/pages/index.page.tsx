import type { GetServerSideProps, NextPage } from "next";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

import { useRouter } from "next/router";
import ReleasePlaceHolder from "../components/ReleasePlaceholder";
import ResultEnvelope from "../components/ResultEnvelope";
import ScanPageHero from "../components/ScanPageHero";
import { getErrorMessage } from "../messages/http";
import { clientHttpClient } from "../services/clientHttpClient";
import { DetailedTarget, IScanSuccessResponse } from "../types";
import { sanitizeFQDN, staticSecrets } from "../utils/common";
import { DTO } from "../utils/server";

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
  code: string;
}
const Home: NextPage<Props> = ({ displayNotAvailable, code }) => {
  const [website, setWebsite] = useState("");
  const scanRequest = useLoading();
  const refreshRequest = useLoading();
  const [target, setTarget] = useState<null | DTO<DetailedTarget>>(null);
  const router = useRouter();

  const onSubmit = useCallback(
    async (e: FormEvent, site: string) => {
      e.preventDefault();

      // test if valid url
      const target = sanitizeFQDN(site);
      if (!target) {
        scanRequest.error("Bitte trage einen gültigen Domainnamen ein.");
        return;
      }
      // react will batch those two calls anyways.
      scanRequest.loading();
      setTarget(null);
      // do the real api call.
      // forward the secret of query param s to the backend
      try {
        const response = await clientHttpClient(
          `/api/scan?site=${encodeURIComponent(target)}&s=${code}`,
          crypto.randomUUID()
        );
        if (!response.ok) {
          const err = await response.json();
          return scanRequest.error(
            `Es ist ein Fehler aufgetreten - Fehlermeldung: ${getErrorMessage(
              err.error
            )}`
          );
        }
        const obj: DTO<DetailedTarget> = await response.json();
        setTarget(obj);
        scanRequest.success();
      } catch (e) {
        console.log("e", e);
        scanRequest.error(
          "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
        );
      }
    },
    [scanRequest, code]
  );

  useEffect(() => {
    if (target) {
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
  }, [target]);

  const scannedSite = useRef<null | string>(null);

  useEffect(() => {
    if (router.query?.site && scannedSite.current !== router.query.site) {
      scannedSite.current = router.query.site as string;
      setWebsite(router.query.site as string);
      onSubmit(
        {
          preventDefault: () => {},
        } as FormEvent,
        router.query.site as string
      );
    }
  }, [router, onSubmit]);

  const handleRefresh = async () => {
    if (!target) {
      return;
    }
    refreshRequest.loading();

    try {
      const response = await clientHttpClient(
        `/api/scan?site=${encodeURIComponent(
          target.uri
        )}&refresh=true&s=${code}`,
        crypto.randomUUID()
      );
      if (!response.ok) {
        const err = await response.json();
        return refreshRequest.error(
          `Es ist ein Fehler aufgetreten - Fehlermeldung: ${getErrorMessage(
            err.error.code
          )}`
        );
      }
      const obj = await response.json();
      setTarget(obj);
      refreshRequest.success();
    } catch (e) {
      refreshRequest.error(
        "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut."
      );
    }
  };

  const amountPassed = useMemo(() => {
    if (!target) return 0;
    return Object.keys(target.details as Record<string, any>)
      .filter((key) =>
        (
          [
            TLSInspectionType.TLSv1_3,
            TLSInspectionType.DeprecatedTLSDeactivated,
            NetworkInspectionType.RPKI,
            DomainInspectionType.DNSSec,
            HeaderInspectionType.HSTS,
            OrganizationalInspectionType.ResponsibleDisclosure,
          ] as string[]
        ).includes(key)
      )
      .map(
        (key) =>
          (target.details as IScanSuccessResponse["result"])[
            key as InspectionType
          ]?.didPass
      )
      .filter((inspection) => !!inspection).length;
  }, [target]);

  const dateString = target
    ? new Date(Number(target.lastScan)).toLocaleString()
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
            onSubmit={(e) => {
              e.preventDefault();
              router.push({
                pathname: router.pathname,
                query: { ...router.query, site: website },
              });
            }}
            setWebsite={setWebsite}
            website={website}
            scanRequest={scanRequest}
          />
          <ResultEnvelope
            target={target}
            dateString={dateString}
            handleRefresh={handleRefresh}
            refreshRequest={refreshRequest}
            amountPassed={amountPassed}
          />
          {/*<div className="bg-deepblue-400 justify-center mx-5 md:mx-0 mb-5 flex flex-col md:flex-row md:justify-between items-center text-white mt-5 p-4">
            <p>Die OZG-Security-Challenge: Hintergrundinfos und Vieles mehr.</p>
            <a
              title="Mehr Informationen zur OZG-Security-Challenge 2023"
              target={"_blank"}
              rel={"noopener noreferrer"}
              className="bg-lightning-500 hover:bg-lightning-900 mt-5 md:mt-0 transition-all px-5 py-2 text-deepblue-500 text-center font-bold"
              href="www.onlinezugangsgesetz.de/ozgsec"
            >
              Mehr erfahren
            </a>
  </div>*/}
        </div>
      </div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  // check if the user does provide a valid query parameter
  const code = query["s"];
  if (code && staticSecrets.includes(code as string)) {
    return {
      props: {
        displayNotAvailable: false,
        code: code,
      },
    };
  }
  return {
    props: {
      displayNotAvailable: true,
      code: !!code ? code : null,
    },
  };
};

export default Home;
