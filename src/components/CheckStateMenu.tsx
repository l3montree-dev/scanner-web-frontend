import {
  faCaretDown,
  faCheck,
  faWarning,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { InspectionType } from "../inspection/scans";
import { titleMapper } from "../messages";
import { classNames } from "../utils/common";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";

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
      menuCloseIndex={0}
      Button={
        <div
          className={classNames(
            "flex flex-row gap-2 text-left items-center font-bold",
            selectedToClassName(+selected)
          )}
        >
          <span>{titleMapper[inspectionType]}</span>
          <FontAwesomeIcon icon={faCaretDown} />
        </div>
      }
      Menu={
        <div className="font-normal">
          <MenuList>
            <MenuItem selected={+selected === 1} onClick={() => handleClick(1)}>
              <FontAwesomeIcon icon={faCheck} />
              <span className="ml-2">Erfüllt</span>
            </MenuItem>
            <MenuItem
              selected={+selected === -1}
              onClick={() => handleClick(-1)}
            >
              <FontAwesomeIcon icon={faWarning} />
              <span className="ml-2">Nicht Erfüllt</span>
            </MenuItem>
            <MenuItem selected={+selected === 0} onClick={() => handleClick(0)}>
              <FontAwesomeIcon icon={faQuestion} />
              <span className="ml-2">Nicht überprüfbar</span>
            </MenuItem>
          </MenuList>
        </div>
      }
    />
  );
};

export default CheckStateMenu;
