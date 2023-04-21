import { FormEvent, FunctionComponent, SetStateAction } from "react";
import Button from "./common/Button";
import Image from "next/image";

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
    <div className="md:bg-deepblue-300 rounded-md px-4 pt-4 md:mt-0 mt-10 p-10">
      <div className="flex flex-wrap sm:flex-nowrap flex-row items-start justify-between">
        <div className="sm:order-1 w-full order-2">
          <h1 className="text-5xl hidden sm:block mb-5 sm:mb-10 text-white font-bold">
            OZG-Security-Challenge 2023
          </h1>
          <div className="flex-row w-full items-center justify-between sm:justify-start mt-0 md:-mt-5 flex">
            <h2 className="text-white text-2xl font-bold">Schnelltest</h2>
            <div className="px-2 py-1 flex flex-row justify-center rounded-sm items-center ml-5 order-1 bg-deepblue-50">
              <span className="text-white whitespace-nowrap">BETA</span>
            </div>
          </div>
        </div>

        <div className="sm:order-1 flex w-full flex-row justify-center sm:justify-end mb-10 sm:mb-0">
          <Image
            width={150}
            height={150}
            src={"/assets/sticker_challenge_white.svg"}
            alt="OZG-Logo"
            className="block sm:inline-block sm:mx-0 mx-auto"
          />
        </div>
      </div>

      <div className="py-5">
        <form onSubmit={onSubmit} className="flex">
          <input
            onChange={(e) => setWebsite(e.target.value)}
            value={website}
            placeholder="example.com"
            className="sm:p-5 rounded-sm bg-white text-black p-4 text-sm sm:text-base flex-1 outline-lightning-900 transition-all mr-3"
          />

          <Button primary loading={scanRequest.isLoading} type="submit">
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
