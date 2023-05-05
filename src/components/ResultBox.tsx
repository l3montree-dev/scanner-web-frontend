import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { FunctionComponent } from "react";
import { classNames } from "../utils/common";
import {
  CheckResult,
  checkResult2Icon,
  checkResult2TextClassName,
} from "../utils/view";

interface Props {
  checkResult: CheckResult;
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
            "text-xl mt-1",
            `text-${checkResult2TextClassName(props.checkResult)}`
          )}
          icon={checkResult2Icon(props.checkResult)}
        />
        <div className={classNames("flex ml-4 md:ml-2 flex-col mt-0.5")}>
          <div>
            <h5
              className={classNames(
                "md:text-lg block leading-8  scroll-mt-11 font-bold"
                // `text-${checkResult2TextClassName(props.checkResult)}`
              )}
            >
              {props.title}
            </h5>
          </div>
          <div className="mt-2 text-small mb-5 h-full">
            <p>{props.description}</p>
          </div>
        </div>
      </div>

      {Boolean(props.link) && (
        <div className="flex flex-row justify-end">
          <a
            target={"_blank"}
            href={props.link as string}
            className="text-small w-full text-blau-100 inline-block text-right top-1 right-0 mt-2"
            rel="noreferrer"
          >
            {props.checkResult === CheckResult.Passed
              ? `Was ist "${props.title}"?`
              : `"${props.title}" jetzt umsetzen!`}
          </a>
        </div>
      )}
    </div>
  );
};

export default ResultBox;
