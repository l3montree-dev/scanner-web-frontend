"use client";

import { useSearchParams } from "next/navigation";
import { FunctionComponent, useEffect } from "react";
import { useQuicktest } from "../hooks/useQuicktest";
import { classNames } from "../utils/common";
import { useGlobalStore } from "../zustand/global";
import ReleasePlaceHolder from "./ReleasePlaceholder";
import ResultEnvelope from "./ResultEnvelope";
import ScanPageHero from "./ScanPageHero";
import GeneralInfoSection from "./GeneralInfoSection";

interface Props {
  displayNotAvailable: boolean;
}
const IndexContent: FunctionComponent<Props> = ({ displayNotAvailable }) => {
  const searchParams = useSearchParams();
  const {
    website,
    setWebsite,
    scanRequest,
    refreshRequest,
    report,
    dateString,
    amountPassed,
    handleRefresh,
    onSubmit,
  } = useQuicktest(searchParams?.get("s"));

  const store = useGlobalStore();

  useEffect(() => {
    store.setHideLogin(displayNotAvailable);
  }, [displayNotAvailable]);

  if (displayNotAvailable) {
    return <ReleasePlaceHolder />;
  }

  return (
    <div className="flex relative md:py-10 flex-col w-full justify-center bg-zinc-950">
      <div className="relative">
        <div className="container relative z-10">
          <div className="border-l-4 border-l3-500 bg-l3-50 p-4 mt-10">
            <div className="flex">
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-l3-800">
                  Dieser Scanner basiert auf dem{" "}
                  <a
                    className="hover:text-l3-600"
                    href="https://bmi.usercontent.opencode.de/ozg-rahmenarchitektur/ozgsec/ozgsec-info/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OZG Security Challenge Projekt
                  </a>{" "}
                  des{" "}
                  <a
                    className="hover:text-l3-600"
                    href="https://www.bmi.bund.de/DE/startseite/startseite-node.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    BMI
                  </a>{" "}
                  &{" "}
                  <a
                    className="hover:text-l3-600"
                    href="https://www.bsi.bund.de/DE/Home/home_node.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    BSI
                  </a>
                </p>
                <p className="mt-3 text-sm md:ml-6 md:mt-0">
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec"
                    className="whitespace-nowrap font-medium text-l3-800 hover:text-l3-600"
                  >
                    Open CoDE
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
          <ScanPageHero
            onSubmit={onSubmit}
            setWebsite={setWebsite}
            website={website}
            scanRequest={scanRequest}
          />
          <div className={classNames(report && "mt-16")}>
            <ResultEnvelope
              report={report}
              dateString={dateString}
              handleRefresh={handleRefresh}
              refreshRequest={refreshRequest}
              amountPassed={amountPassed}
            />
          </div>
        </div>
        <div className="mt-24">
          <GeneralInfoSection />
        </div>
      </div>
    </div>
  );
};

export default IndexContent;
