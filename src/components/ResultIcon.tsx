import {
  faCheck,
  faCheckCircle,
  faQuestion,
  faTimes,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent } from "react";

interface Props {
  didPass?: boolean | null;
}
const ResultIcon: FunctionComponent<Props> = ({ didPass }) => {
  return (
    <FontAwesomeIcon
      className={
        didPass
          ? "text-lightning-500"
          : didPass === false
          ? "text-yellow-500"
          : "text-gray-500"
      }
      fontSize={24}
      icon={didPass ? faCheck : didPass === false ? faWarning : faQuestion}
    />
  );
};

export default ResultIcon;
