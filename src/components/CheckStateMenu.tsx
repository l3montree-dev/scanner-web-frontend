import {
  faCaretDown,
  faCheck,
  faQuestion,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { InspectionType } from "../inspection/scans";
import { titleMapper } from "../messages";
import { classNames } from "../utils/common";
import DropdownMenuItem from "./common/DropdownMenuItem";
import Menu from "./common/Menu";

interface Props {
  onChange: (
    inspectionType: InspectionType,
    checkState: 1 | 0 | -1 | undefined
  ) => void;
  inspectionType: InspectionType;
}

const selectedToClassName = (selected: number) => {
  switch (selected) {
    case 1:
      return "text-lightning-500";
    case -1:
      return "text-yellow-500";
    case 0:
      return "text-gray-300";
    default:
      return "text-white";
  }
};
const CheckStateMenu: FunctionComponent<Props> = ({
  inspectionType,
  onChange,
}) => {
  const router = useRouter();

  const selected = router.query[inspectionType] ?? -2;

  const handleClick = (value: 1 | 0 | -1) => {
    if (value === +selected) {
      return onChange(inspectionType, undefined);
    }
    onChange(inspectionType, value);
  };

  return (
    <Menu
      Button={
        <div
          title={titleMapper[inspectionType]}
          className={classNames(
            "flex flex-row gap-2 text-left w-24 items-center font-bold",
            selectedToClassName(+selected)
          )}
        >
          <span className="text-ellipsis overflow-hidden whitespace-nowrap">
            {titleMapper[inspectionType]}
          </span>
          <FontAwesomeIcon className="flex-1" icon={faCaretDown} />
        </div>
      }
      Menu={
        <div className="font-normal">
          <>
            <DropdownMenuItem
              active={+selected === 1}
              Icon={<FontAwesomeIcon icon={faCheck} />}
              onClick={() => handleClick(1)}
            >
              Erfüllt
            </DropdownMenuItem>
            <DropdownMenuItem
              Icon={<FontAwesomeIcon icon={faWarning} />}
              active={+selected === -1}
              onClick={() => handleClick(-1)}
            >
              Nicht Erfüllt
            </DropdownMenuItem>
            <DropdownMenuItem
              Icon={<FontAwesomeIcon icon={faQuestion} />}
              active={+selected === 0}
              onClick={() => handleClick(0)}
            >
              Nicht überprüfbar
            </DropdownMenuItem>
          </>
        </div>
      }
    />
  );
};

export default CheckStateMenu;
