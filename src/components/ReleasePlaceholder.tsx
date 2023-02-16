import { FunctionComponent } from "react";

const ReleasePlaceHolder: FunctionComponent = () => {
  return (
    <div className="flex md:py-10 flex-col w-full justify-center text-white">
      <div className="max-w-screen-lg w-full md:p-5 p-0 pb-0 mx-auto">
        <div className="flex justify-center mt-5">
          <img
            width={150}
            height={150}
            src={"/assets/sticker_challenge_white.svg"}
            alt="OZG-Logo"
          />
        </div>
        <div className="md:mt-0 text-center p-5">
          <h1 className="text-5xl sm:order-1 order-2 mb-3 font-bold">
            OZG-Security-Challenge 2023
          </h1>
        </div>
        <div className="md:mt-0 text-white text-center pb-14 p-5 pt-0 md:pt-5">
          <p className="text-white">
            Neugierig?{" "}
            <a className="text-underline" href="mailto:ozgsec@bmi.bund.de">
              ozgsec@bmi.bund.de
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReleasePlaceHolder;
