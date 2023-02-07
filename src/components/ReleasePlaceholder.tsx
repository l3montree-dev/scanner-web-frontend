import { FunctionComponent } from "react";

import Countdown from "./Countdown";
import Subscribe from "./Subscribe";

const ReleasePlaceHolder: FunctionComponent = () => {
  return (
    <div className="flex md:py-10 flex-col w-full justify-center text-white">
      <div className="max-w-screen-lg w-full md:p-5 mx-auto">
        <div className="md:mt-0 mt-10 md:p-10 text-center pb-14 p-5">
          <h1 className="text-5xl sm:order-1 order-2 mb-3 font-bold">
            OZG Security Challenge 2023
          </h1>
          <p className="text-white mt-10">
            Der Countdown läuft - die OZG Security Challenge starte in:
          </p>
        </div>
        <Countdown />
        <div className="md:mt-0 mt-10 md:p-10 text-white text-center pb-14 p-5">
          <p className="text-white">
            Mit unserem hier entstehenden Schnelltest können Sie Ihre Webseite
            in Bezug auf sechs spezifische IT-Sicherheitskriterien testen.
            Machen Sie mit und tragen Sie zur weiteren Steigerung der Sicherheit
            der öffentlichen Verwaltung bei.
          </p>
        </div>
        <Subscribe />
      </div>
    </div>
  );
};

export default ReleasePlaceHolder;
