import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent } from "react";
import { legendMessages } from "../messages/legend";
import {
  CheckResult,
  checkResult2BorderClassName,
  checkResult2Icon,
} from "../utils/view";
import Tooltip from "./Tooltip";

interface Props {
  checkResult: CheckResult;
}
const ResultIcon: FunctionComponent<Props> = ({ checkResult }) => {
  return (
    <Tooltip tooltip={legendMessages(checkResult)}>
      <FontAwesomeIcon
        className={`text-${checkResult2BorderClassName(checkResult)}`}
        fontSize={24}
        icon={checkResult2Icon(checkResult)}
      />
    </Tooltip>
  );
};

export default ResultIcon;
