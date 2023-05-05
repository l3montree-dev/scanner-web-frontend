import type { GetServerSideProps, NextPage } from "next";
import Meta from "../components/Meta";
import Page from "../components/Page";
import Image from "next/image";

import ReleasePlaceHolder from "../components/ReleasePlaceholder";
import ResultEnvelope from "../components/ResultEnvelope";
import ScanPageHero from "../components/ScanPageHero";
import { useQuicktest } from "../hooks/useQuicktest";
import { monitoringService } from "../services/monitoringService";
import { staticSecrets } from "../utils/staticSecrets";

interface Props {
  displayNotAvailable: boolean;
  code: string;
}
const Home: NextPage<Props> = ({ displayNotAvailable, code }) => {
  const {
    website,
    setWebsite,
    scanRequest,
    refreshRequest,
    target,
    dateString,
    amountPassed,
    handleRefresh,
    onSubmit,
  } = useQuicktest(code);

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
      <div className="flex relative overflow-hidden md:py-10 flex-col w-full justify-center">
        <div className="relative">
          <Image
            className="absolute hidden lg:inline -z-10 top-0 right-0"
            width={500}
            height={225}
            priority
            src={"/assets/Adler_Ausschnitt_1.svg"}
            alt="OZG-Logo"
          />
          <div className="container">
            <ScanPageHero
              onSubmit={onSubmit}
              setWebsite={setWebsite}
              website={website}
              scanRequest={scanRequest}
            />
            <div className="my-10">
              <ResultEnvelope
                target={target}
                dateString={dateString}
                handleRefresh={handleRefresh}
                refreshRequest={refreshRequest}
                amountPassed={amountPassed}
              />
            </div>
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
      </div>
    </Page>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  // check if the user does provide a valid query parameter
  const code = query["s"];
  if (code && staticSecrets[code as string]) {
    monitoringService.trackSecret(code as string);
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
