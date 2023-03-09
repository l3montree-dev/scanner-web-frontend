import {
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection, Target } from "@prisma/client";
import Link from "next/link";
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
import CollectionMenu from "./CollectionMenu";
import CollectionPill from "./CollectionPill";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";
import ResultIcon from "./ResultIcon";
import Tooltip from "./Tooltip";

interface Props {
  onSelect: (target: DTO<DetailedTarget>) => void;
  target: DTO<DetailedTarget> & { collections?: number[] };
  classNames?: string;
  selected: boolean;
  scanRequest: ReturnType<typeof useLoading>;
  scan: (uri: string) => void;
  destroy: (uri: string) => void;
  onToggleCollection: (collection: DTO<Collection>) => void;
  collections: { [collectionId: string]: DTO<Collection> };
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
  onToggleCollection,
  collections,
}) => {
  return (
    <>
      <tr
        onClick={() => onSelect(target)}
        className={classNames(
          "cursor-pointer",
          target.errorCount !== null && target.errorCount >= 5
            ? "line-through"
            : "",
          clNames,
          target.collections !== undefined &&
            target.collections.length > 0 &&
            "border-none" // the second row will be displayed, which does include the border
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
                <FontAwesomeIcon
                  className="opacity-50"
                  icon={faQuestionCircle}
                />
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
              checkResult={didPass2CheckResult(
                target.details?.tlsv1_3?.didPass
              )}
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
        <td className="text-right p-2" onClick={(e) => e.stopPropagation()}>
          <Menu
            menuCloseIndex={0}
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

                {Object.keys(collections).length > 0 ? (
                  <CollectionMenu
                    collections={collections}
                    Button={
                      <div
                        className={classNames(
                          "p-2 flex-row flex items-center px-4 hover:bg-deepblue-50 cursor-pointer w-full text-left"
                        )}
                      >
                        Zu Sammlung hinzufügen
                      </div>
                    }
                    selectedCollections={target.collections ?? []}
                    onCollectionClick={(collection) =>
                      onToggleCollection(collection)
                    }
                  />
                ) : (
                  <Link
                    className="hover:no-underline block hover:bg-deepblue-50"
                    href={"/dashboard/collections"}
                  >
                    <div className="text-left px-4 py-2">
                      Sammlung erstellen
                    </div>
                  </Link>
                )}

                <MenuItem onClick={() => destroy(target.uri)}>
                  <div>Löschen</div>
                </MenuItem>
              </MenuList>
            }
          />
        </td>
      </tr>
      {target.collections !== undefined && target.collections.length > 0 && (
        <tr
          onClick={() => onSelect(target)}
          className={classNames(clNames, "cursor-pointer")}
        >
          <td colSpan={9} className="p-0 pb-2">
            <div className="flex flex-row gap-2 px-5 -mt-2 pl-10 justify-start">
              {target.collections.map((c) => {
                const col = collections[c.toString()];
                return <CollectionPill key={col.id} {...col} />;
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TargetTableItem;
