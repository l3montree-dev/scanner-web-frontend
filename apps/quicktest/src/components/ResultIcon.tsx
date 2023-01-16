import {
  faCheck,
  faCheckCircle,
  faQuestion,
  faTimes,
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
          ? "text-red-500"
          : "text-gray-500"
      }
      fontSize={24}
      icon={didPass ? faCheck : didPass === false ? faTimes : faQuestion}
    />
  );
};

export default ResultIcon;
