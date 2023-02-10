import { FunctionComponent } from "react";

import Countdown from "./Countdown";
import Subscribe from "./Subscribe";

const ReleasePlaceHolder: FunctionComponent = () => {
  return (
    <div className="flex md:py-10 flex-col w-full justify-center text-white">
      <div className="max-w-screen-lg w-full md:p-5 mx-auto">
        <div className="flex justify-center mt-5">
          <img
            width={150}
            height={150}
            src={"/assets/sticker_challenge_white.svg"}
            alt="OZG-Logo"
          />
        </div>
        <div className="md:mt-0 md:p-10 text-center pb-14 p-5">
          <h1 className="text-5xl sm:order-1 order-2 mb-3 font-bold">
            OZG-Security-Challenge 2023
          </h1>
          <p className="text-white mt-10">
            Der Countdown läuft - die OZG-Security-Challenge startet in:
          </p>
        </div>
        <Countdown />
        <div className="md:mt-0 mt-10 md:p-10 text-white text-center pb-14 p-5">
          <p className="text-white">
            Hier können Sie demnächst Ihre Webseite in Bezug auf sechs
            spezifische IT-Sicherheitsmaßnahmen testen. Nutzen Sie unseren
            Schnelltest und tragen Sie zur weiteren Steigerung der IT-Sicherheit
            in der öffentlichen Verwaltung bei.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReleasePlaceHolder;
