import {
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Target } from "@prisma/client";
import { FunctionComponent } from "react";
import useLoading from "../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { getCheckDescription } from "../messages";
import { DetailedTarget } from "../types";
import { classNames, toGermanDate } from "../utils/common";
import { DTO } from "../utils/server";
import { didPass2CheckResult } from "../utils/view";
import Checkbox from "./Checkbox";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";
import ResultIcon from "./ResultIcon";
import Tooltip from "./Tooltip";

interface Props {
  onSelect: (target: DTO<DetailedTarget>) => void;
  target: DTO<DetailedTarget>;
  classNames?: string;
  selected: boolean;
  scanRequest: ReturnType<typeof useLoading>;
  scan: (uri: string) => void;
  destroy: (uri: string) => void;
}

const infoMessage = (target: DTO<Target>) => {
  return target.lastScan !== null
    ? `Letzter Scan: ${toGermanDate(new Date(target.lastScan))}${
        target.errorCount !== null && target.errorCount > 0
          ? ` (${target.errorCount} Fehler)`
          : ""
      }${
        target.errorCount !== null && target.errorCount >= 5
          ? " target wird nicht mehr automatisiert gescanned, da 5 Fehler überschritten wurden"
          : ""
      }`
    : "Noch nicht gescannt";
};
const TargetTableItem: FunctionComponent<Props> = ({
  onSelect,
  target,
  classNames: clNames,
  selected,
  scanRequest,
  scan,
  destroy,
}) => {
  return (
    <tr
      onClick={() => onSelect(target)}
      className={classNames(
        "cursor-pointer",
        target.errorCount !== null && target.errorCount >= 5
          ? "line-through"
          : "",
        clNames
      )}
    >
      <td className="p-2 pr-0">
        <div className="flex flex-row items-center">
          <Checkbox onChange={() => onSelect(target)} checked={selected} />
        </div>
      </td>
      <td className="p-2">
        <div className="flex flex-row">
          <span
            title={target.uri}
            className="whitespace-nowrap overflow-hidden text-ellipsis max-w-xs block"
          >
            {target.uri}
          </span>
          <div className="inline ml-2">
            <Tooltip tooltip={infoMessage(target)}>
              <FontAwesomeIcon className="opacity-50" icon={faQuestionCircle} />
            </Tooltip>
          </div>
        </div>
      </td>
      <td className="p-2">
        <Tooltip
          tooltip={getCheckDescription(
            target,
            OrganizationalInspectionType.ResponsibleDisclosure
          )}
        >
          <ResultIcon
            checkResult={didPass2CheckResult(
              target.details?.responsibleDisclosure?.didPass
            )}
          />
        </Tooltip>
      </td>
      <td className="p-2">
        <Tooltip
          tooltip={getCheckDescription(target, TLSInspectionType.TLSv1_3)}
        >
          <ResultIcon
            checkResult={didPass2CheckResult(target.details?.tlsv1_3?.didPass)}
          />
        </Tooltip>
      </td>
      <td className="p-2">
        <Tooltip
          tooltip={getCheckDescription(
            target,
            TLSInspectionType.DeprecatedTLSDeactivated
          )}
        >
          <ResultIcon
            checkResult={didPass2CheckResult(
              target.details?.deprecatedTLSDeactivated?.didPass
            )}
          />
        </Tooltip>
      </td>
      <td className="p-2">
        <Tooltip
          tooltip={getCheckDescription(target, HeaderInspectionType.HSTS)}
        >
          <ResultIcon
            checkResult={didPass2CheckResult(target.details?.hsts?.didPass)}
          />
        </Tooltip>
      </td>
      <td className="p-2">
        <Tooltip
          tooltip={getCheckDescription(target, DomainInspectionType.DNSSec)}
        >
          <ResultIcon
            checkResult={didPass2CheckResult(target.details?.dnsSec?.didPass)}
          />
        </Tooltip>
      </td>
      <td className="p-2">
        <Tooltip
          tooltip={getCheckDescription(target, NetworkInspectionType.RPKI)}
        >
          <ResultIcon
            checkResult={didPass2CheckResult(target.details?.rpki?.didPass)}
          />
        </Tooltip>
      </td>
      <td className="text-right p-2">
        <Menu
          Button={
            <div className="p-2 h-8 w-8 flex flex-row items-center justify-center">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </div>
          }
          Menu={
            <MenuList>
              <MenuItem
                loading={
                  scanRequest.key === target.uri && scanRequest.isLoading
                }
                onClick={() => scan(target.uri)}
              >
                <div>
                  <div>Erneut scannen</div>
                  {scanRequest.key === target.uri && (
                    <span className="block text-red-500 text-sm">
                      {scanRequest.errorMessage}
                    </span>
                  )}
                </div>
              </MenuItem>
              <MenuItem onClick={() => destroy(target.uri)}>
                <div>Löschen</div>
              </MenuItem>
            </MenuList>
          }
        />
      </td>
    </tr>
  );
};

export default TargetTableItem;
