import { FunctionComponent } from "react";
import Image from "next/image";

const ReleasePlaceHolder: FunctionComponent = () => {
  return (
    <div className="flex md:py-10 flex-col w-full justify-center text-white">
      <div className="max-w-screen-lg w-full md:p-5 p-0 pb-0 mx-auto">
        <div className="flex justify-center my-5">
          <Image
            width={225}
            height={225}
            src={"/assets/sticker_challenge_white.svg"}
            alt="OZG-Logo"
          />
        </div>
        <div className="md:mt-0 text-white text-center pb-14 text-2xl p-5 pt-0 md:pt-5">
          <p className="text-white">
            Neugierig? <br />
            <a className="underline" href="mailto:ozgsec@bmi.bund.de">
              ozgsec@bmi.bund.de
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReleasePlaceHolder;
