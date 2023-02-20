import { FormEvent, FunctionComponent, SetStateAction } from "react";
import Button from "./Button";

interface Props {
  onSubmit: (e: FormEvent) => void;
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
    <div className="md:bg-deepblue-400 px-4 pt-4 md:mt-0 mt-10 p-10">
      <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
        <div className="sm:order-1 order-2">
          <h1 className="text-5xl mb-5 sm:mb-10 text-white font-bold">
            OZG-Security-Challenge 2023
          </h1>
          <div className="flex-row items-center mt-0 md:-mt-5 flex">
            <h2 className="text-white text-2xl">Schnelltest </h2>
            <div className="px-2 py-1 flex flex-row justify-center items-center ml-5 order-1 bg-deepblue-200">
              <span className="text-white whitespace-nowrap">BETA</span>
            </div>
          </div>
        </div>

        <div className="sm:order-1 mb-10 sm:mb-0">
          <img
            width={150}
            //height={150}
            src={"/assets/sticker_challenge_white.svg"}
            alt="OZG-Logo"
          />
        </div>
      </div>

      <div className="pb-10">
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
          <small className="text-red-600 mt-3 -mb-5 flex">
            {scanRequest.errorMessage}
          </small>
        )}
      </div>
      <p className="text-white">
        Hier können Sie Ihre Webseite in Bezug auf sechs spezifische
        IT-Sicherheitsmaßnahmen testen. Nutzen Sie unseren Schnelltest und
        tragen Sie zur weiteren Steigerung der IT-Sicherheit in der öffentlichen
        Verwaltung bei.
      </p>
    </div>
  );
};

export default ScanPageHero;
