import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent } from "react";
import {
  CheckResult,
  checkResult2BorderClassName,
  checkResult2Icon,
} from "../utils/view";
import { classNames } from "../utils/common";

interface Props {
  checkResult: CheckResult;
  className?: string;
  size?: number;
}
const ResultIcon: FunctionComponent<Props> = ({
  checkResult,
  className,
  size,
}) => {
  return (
    <FontAwesomeIcon
      className={classNames(
        `text-${checkResult2BorderClassName(checkResult)}`,
        className
      )}
      fontSize={size ?? 24}
      icon={checkResult2Icon(checkResult)}
    />
  );
};

export default ResultIcon;
