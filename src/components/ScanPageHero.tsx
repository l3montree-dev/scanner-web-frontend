import { FormEvent, FunctionComponent, SetStateAction } from "react";
import Button from "./common/Button";
import Image from "next/image";
import FormInput from "./FormInput";

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
    <div className="bg-bund -mx-4 md:mx-0 md:mt-10 p-4 md:p-10">
      <div className="flex flex-wrap sm:flex-nowrap flex-col sm:flex-row items-start justify-between">
        <div className="sm:order-1 w-full flex-1 order-2">
          <h1 className="text-2xl hidden sm:block mb-5 sm:mb-5 text-white font-bold">
            OZG-Security-Challenge 2023
          </h1>
          <div className="flex-row items-center justify-between sm:justify-start mt-0 md:-mt-5 flex">
            <h2 className="text-white text-xl font-bold">Schnelltest</h2>
            <div className="px-2 py-1 flex flex-row justify-center items-center ml-5 order-1 bg-hellgrau-100">
              <span className="whitespace-nowrap">BETA</span>
            </div>
          </div>
        </div>

        <div className="sm:order-1 sm:w-auto w-full flex flex-row justify-center sm:justify-end mb-10 sm:mb-0">
          <Image
            width={200}
            height={200}
            src={"/assets/sticker_challenge_white.svg"}
            alt="OZG-Logo"
            className="block sm:inline-block sm:mx-0 mx-auto"
          />
        </div>
      </div>

      <div className="py-10">
        <form
          onSubmit={onSubmit}
          className="flex flex-row flex-wrap justify-end items-end gap-5"
        >
          <div className="text-white flex-1">
            <FormInput
              focusColor="white"
              containerClassNames="flex-1"
              label="Website"
              onChange={(e) => setWebsite(e)}
              value={website}
              inputClassNames="border-b-white"
            />
          </div>
          <Button
            LeftIcon={
              <Image
                src={"/assets/icons/icon-arrow-right.svg"}
                alt="Scan starten"
                width={20}
                height={20}
              />
            }
            additionalClasses="border-white"
            loading={scanRequest.isLoading}
            type="submit"
          >
            Scan starten
          </Button>
        </form>

        {scanRequest.errored && (
          <small className="text-rot-40 mt-3 -mb-5 flex">
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
