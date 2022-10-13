import {
  faCheck,
  faCheckCircle,
  faTimes,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";
import { classNames } from "../utils/style-utils";

interface Props {
  didPass: boolean;
  title: string;
  description: string;
}
const ResultBox: FunctionComponent<Props> = (props) => {
  return (
    <div className="flex-col h-full flex">
      <div className="flex flex-1 flex-row">
        <FontAwesomeIcon
          className={classNames(
            "md:text-2xl text-3xl",
            props.didPass ? "text-lightning-500" : "text-red-500"
          )}
          icon={props.didPass ? faCheck : faTimes}
        />
        <div className={classNames("flex ml-4 md:ml-2 flex-col mt-0.5")}>
          <div>
            <h5
              className={classNames(
                "md:text-lg md:leading-5 block text-2xl leading-6 scroll-mt-11 font-bold",
                props.didPass ? "text-lightning-500" : "text-red-500"
              )}
            >
              {props.title}
            </h5>
          </div>
          <div className="mt-2 mb-5 h-full">
            <p>{props.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-end">
        <a
          target="_blank"
          href="https://www.onlinezugangsgesetz.de/Webs/OZG/DE/themen/ozg-infrastruktur/infrastruktur-node.html"
          rel="noreferrer"
        >
          <button className="bg-deepblue-200 hover:bg-deepblue-600 text-white font-bold py-2 px-4">
            Mehr Informationen
          </button>
        </a>
      </div>
    </div>
  );
};

export default ResultBox;
