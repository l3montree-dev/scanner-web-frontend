import {
  faCheck,
  faQuestion,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, ReactNode } from "react";
import { classNames } from "../utils/common";

interface Props {
  didPass: boolean | null;
  title: string;
  description: string;
  link?: string;
}

const ResultBox: FunctionComponent<Props> = (props) => {
  return (
    <div className="flex-col h-full flex">
      <div className="flex flex-1 flex-row">
        <FontAwesomeIcon
          className={classNames(
            "md:text-2xl text-3xl",
            props.didPass === null
              ? "text-white"
              : props.didPass
              ? "text-lightning-500"
              : "text-red-500"
          )}
          icon={
            props.didPass === null
              ? faQuestion
              : props.didPass
              ? faCheck
              : faTimes
          }
        />
        <div className={classNames("flex ml-4 md:ml-2 flex-col mt-0.5")}>
          <div>
            <h5
              className={classNames(
                "md:text-lg md:leading-5 block text-2xl leading-6 scroll-mt-11 font-bold",
                props.didPass === null
                  ? "text-white"
                  : props.didPass
                  ? "text-lightning-500"
                  : "text-red-500"
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

      {props.link !== undefined && (
        <div className="flex flex-row justify-end">
          <a
            className="text-sm underline"
            target="_blank"
            download
            href={props.link}
            rel="noreferrer"
          >
            Mehr Informationen
          </a>
        </div>
      )}
    </div>
  );
};

export default ResultBox;
