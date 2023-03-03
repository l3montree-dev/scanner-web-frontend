import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent } from "react";
import {
  CheckResult,
  checkResult2BorderClassName,
  checkResult2Icon,
} from "../utils/view";

interface Props {
  checkResult: CheckResult;
}
const ResultIcon: FunctionComponent<Props> = ({ checkResult }) => {
  return (
    <FontAwesomeIcon
      className={`text-${checkResult2BorderClassName(checkResult)}`}
      fontSize={24}
      icon={checkResult2Icon(checkResult)}
    />
  );
};

export default ResultIcon;
