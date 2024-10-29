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
    testAmount,
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
              testAmount={testAmount}
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
