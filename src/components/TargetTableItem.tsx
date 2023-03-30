import {
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection, Target } from "@prisma/client";
import Link from "next/link";
import { toUnicode } from "punycode";
import { FunctionComponent } from "react";
import { useIsGuest } from "../hooks/useIsGuest";
import useLoading from "../hooks/useLoading";
import {
  DomainInspectionType,
  HeaderInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { getCheckDescription, titleMapper } from "../messages";
import { DetailedTarget } from "../types";
import { classNames, toGermanDate } from "../utils/common";
import { DTO } from "../utils/server";
import { didPass2CheckResult } from "../utils/view";
import Checkbox from "./Checkbox";
import CollectionMenuContent from "./CollectionMenuContent";
import CollectionPill from "./CollectionPill";
import DropdownMenuItem from "./common/DropdownMenuItem";
import Menu from "./common/Menu";
import SubMenu from "./common/SubMenu";
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
  const isGuest = useIsGuest();
  return (
    <>
      <tr
        onClick={() => onSelect(target)}
        className={classNames(
          "cursor-pointer relative lg:static lg:rounded-t-none mt-3 grid-cols-8 lg:mt-0 grid lg:table-row flex-wrap rounded-t-md",
          target.errorCount !== null && target.errorCount >= 5
            ? "line-through"
            : "",
          clNames,
          Object.keys(collections).length === 0 ? "rounded-b-md" : ""
        )}
      >
        <td className="px-4 py-2 lg:p-2 col-span-1 bg-deepblue-50 lg:bg-transparent lg:rounded-tl-none pr-0 rounded-tl-md">
          {!isGuest && (
            <div className="flex flex-row  items-center">
              <Checkbox onChange={() => onSelect(target)} checked={selected} />
            </div>
          )}
        </td>
        <td className="px-4 py-2 lg:p-2 col-span-7 bg-deepblue-50 lg:bg-transparent lg:rounded-tr-none rounded-tr-md">
          <div className="flex flex-row">
            <span
              title={target.uri}
              className="lg:whitespace-nowrap overflow-hidden text-ellipsis max-w-xs block"
            >
              {toUnicode(target.uri)}
            </span>
            <div className="hidden lg:inline ml-2">
              <Tooltip tooltip={infoMessage(target)}>
                <FontAwesomeIcon
                  className="opacity-50"
                  icon={faQuestionCircle}
                />
              </Tooltip>
            </div>
          </div>
        </td>
        <td className="px-4 py-2 lg:p-2 col-span-8 flex lg:table-cell flex-row justify-between items-center">
          <span className="lg:hidden text-sm opacity-75">
            {titleMapper[OrganizationalInspectionType.ResponsibleDisclosure]}
          </span>
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
        <td className="px-4 py-2 lg:p-2 col-span-8 flex lg:table-cell flex-row items-center justify-between">
          <span className="lg:hidden text-sm opacity-75">
            {titleMapper[TLSInspectionType.TLSv1_3]}
          </span>
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
        <td className="px-4 py-2 lg:p-2 col-span-8 flex lg:table-cell flex-row justify-between items-center">
          <span className="lg:hidden text-sm opacity-75">
            {titleMapper[TLSInspectionType.DeprecatedTLSDeactivated]}
          </span>
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
        <td className="px-4 py-2 lg:p-2 col-span-8 flex lg:table-cell flex-row justify-between items-center">
          <span className="lg:hidden text-sm opacity-75">
            {titleMapper[HeaderInspectionType.HSTS]}
          </span>
          <Tooltip
            tooltip={getCheckDescription(target, HeaderInspectionType.HSTS)}
          >
            <ResultIcon
              checkResult={didPass2CheckResult(target.details?.hsts?.didPass)}
            />
          </Tooltip>
        </td>
        <td className="px-4 py-2 lg:p-2 col-span-8 flex lg:table-cell flex-row justify-between items-center">
          <span className="lg:hidden text-sm opacity-75">
            {titleMapper[DomainInspectionType.DNSSec]}
          </span>
          <Tooltip
            tooltip={getCheckDescription(target, DomainInspectionType.DNSSec)}
          >
            <ResultIcon
              checkResult={didPass2CheckResult(target.details?.dnsSec?.didPass)}
            />
          </Tooltip>
        </td>
        <td className="px-4 py-2 lg:p-2 col-span-8 flex lg:table-cell flex-row justify-between items-center">
          <span className="lg:hidden text-sm opacity-75">
            {titleMapper[NetworkInspectionType.RPKI]}
          </span>
          <Tooltip
            tooltip={getCheckDescription(target, NetworkInspectionType.RPKI)}
          >
            <ResultIcon
              checkResult={didPass2CheckResult(target.details?.rpki?.didPass)}
            />
          </Tooltip>
        </td>
        <td
          className="text-right -top-1 -right-2 px-4 py-2 lg:p-2 absolute lg:static"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row justify-end">
            <Menu
              Button={
                <div className="px-4 py-2 lg:p-2 h-8 w-8 flex flex-row items-center justify-center">
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </div>
              }
              Menu={
                <>
                  <DropdownMenuItem
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
                  </DropdownMenuItem>

                  {!isGuest && (
                    <>
                      {Object.keys(collections).length > 0 ? (
                        <SubMenu
                          Button={<div>Gruppen</div>}
                          Menu={
                            <CollectionMenuContent
                              collections={collections}
                              selectedCollections={target.collections ?? []}
                              onCollectionClick={(collection) =>
                                onToggleCollection(collection)
                              }
                            />
                          }
                        />
                      ) : (
                        <Link
                          className="hover:no-underline block"
                          href={"/dashboard/collections"}
                        >
                          <DropdownMenuItem>Gruppe erstellen</DropdownMenuItem>
                        </Link>
                      )}

                      <DropdownMenuItem onClick={() => destroy(target.uri)}>
                        Löschen
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              }
            />
          </div>
        </td>
      </tr>
      {target.collections !== undefined && target.collections.length > 0 && (
        <tr
          onClick={() => onSelect(target)}
          className={classNames(
            clNames,
            "cursor-pointer rounded-b-md lg:rounded-none pointer-events-none"
          )}
        >
          <td colSpan={9} className="py-2 lg:pb-2">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-row gapx-4 py-2 lg:p-2 lg:px-5 px-2 -mt-2 lg:pl-10 justify-start"
            >
              {target.collections.map((c) => {
                const col = collections[c.toString()];
                return (
                  <CollectionPill
                    onRemove={() => onToggleCollection(col)}
                    key={col.id}
                    {...col}
                  />
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TargetTableItem;
