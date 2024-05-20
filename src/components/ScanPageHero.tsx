import Image from "next/image";
import { FormEvent, FunctionComponent, SetStateAction } from "react";
import FormInput from "./common/FormInput";
import Button from "./common/Button";

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
    <div className="bg-zinc-900 p-12 mt-10">
      <div className="flex flex-wrap sm:flex-nowrap flex-col sm:flex-row items-start justify-between">
        <div className="sm:order-1 w-full flex-1 order-2">
          <h1 className="text-xl sm:text-2xl sm:block mb-5 sm:mb-5 text-white font-bold">
            Security Challenge Schnelltest
          </h1>
          <div className="flex-row items-center justify-between sm:justify-start mt-0 md:-mt-5 flex">
            <h2 className="text-l3-400 text-base sm:text-xl font-bold">
              BETA-Cybersecurity-Werkzeug
            </h2>
          </div>
        </div>
      </div>

      <div className="py-10 mt-12">
        <form
          onSubmit={onSubmit}
          className="flex flex-row flex-wrap justify-end items-end gap-5"
        >
          <div className="text-white flex-1">
            <FormInput
              focusColor="white"
              containerClassNames="flex-1"
              label="Domain (z.B. www.example.com)"
              onChange={(e) => setWebsite(e)}
              value={website}
              inputClassNames="border-b-white"
            />
          </div>
          <Button
            LeftIcon={
              <svg
                className="w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 14"
              >
                <path
                  d="M15.1 6.8 8.5.2a.2.2 0 0 0-.3 0l-1 1a.2.2 0 0 0 0 .4L11.4 6H1.2a.3.3 0 0 0-.2.3v1.5a.3.3 0 0 0 .3.2h10.2L7 12.4a.2.2 0 0 0 0 .3l1 1a.2.2 0 0 0 .4 0l6.6-6.5a.3.3 0 0 0 0-.4Z"
                  data-name="arrow-right"
                />
              </svg>
            }
            additionalClasses="border-white hover:border-white"
            loading={scanRequest.isLoading}
            id="scan-start-button"
            data-umami-event="Scan triggered"
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
      <p className="text-white text-sm sm:text-base">
        Hier können Sie Ihre Webseite in Bezug auf sechs spezifische
        IT-Sicherheitsmaßnahmen testen. Nutzen Sie unseren Schnelltest und
        tragen Sie zur weiteren Steigerung der IT-Sicherheit bei.
      </p>
    </div>
  );
};

export default ScanPageHero;
