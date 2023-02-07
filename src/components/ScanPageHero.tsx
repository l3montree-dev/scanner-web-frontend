import React, { FormEvent, FunctionComponent, SetStateAction } from "react";
import Button from "./Button";

interface Props {
  onSubmit: (e: FormEvent) => Promise<void>;
  setWebsite: (value: SetStateAction<string>) => void;
  website: string;
  scanRequest: {
    loading: (key?: string) => void;
    success: () => void;
    error: (err: string, key?: string) => void;
    isLoading: boolean;
    errorMessage: string;
    errored: boolean;
    key: string;
    successed: boolean;
  };
}

const ScanPageHero: FunctionComponent<Props> = ({
  onSubmit,
  setWebsite,
  website,
  scanRequest,
}) => {
  return (
    <div className="md:bg-deepblue-400 p-4 pb-14 md:mt-0 mt-10 md:p-10">
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
        ausgewählte IT-Sicherheitskriterien und Best Practices durchgeführt
        werden. Um einen Scan zu starten, geben Sie eine Webseite-Domain ein und
        drücken Sie auf den Button „Scan starten“.
      </p>
    </div>
  );
};

export default ScanPageHero;
