import {
  faEllipsisVertical,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collection, Target } from "@prisma/client";
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
} from "../scanner/scans";
import { getCheckDescription, titleMapper } from "../messages";
import { DetailedTarget } from "../types";
import { classNames, toGermanDate } from "../utils/common";
import { DTO } from "../utils/server";
import { didPass2CheckResult } from "../utils/view";
import Checkbox from "./common/Checkbox";
import ResultIcon from "./ResultIcon";
import Tooltip from "./common/Tooltip";
import DropdownMenuItem from "./common/DropdownMenuItem";
import Menu from "./common/Menu";
import Spinner from "./common/Spinner";
import Link from "next/link";

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
  collections,
}) => {
  const isGuest = useIsGuest();
  return (
    <>
      <tr
        onClick={() => onSelect(target)}
        className={classNames(
          "cursor-pointer relative lg:static ´ mt-3 grid-cols-8 lg:mt-0 grid lg:table-row flex-wrap",
          target.errorCount !== null && target.errorCount >= 5
            ? "line-through"
            : "",
          clNames,
          Object.keys(collections).length === 0 ? "rounded-b-md" : ""
        )}
      >
        <td
          className="px-4 py-2
         lg:p-2 absolute lg:static top-2 bg-dunkelblau-100 lg:bg-transparent pr-0"
        >
          {!isGuest && (
            <div className="flex flex-row h-full items-center">
              <Checkbox onChange={() => onSelect(target)} checked={selected} />
            </div>
          )}
        </td>
        <td className="px-4 py-2 lg:p-2 col-span-8  bg-dunkelblau-100  text-white lg:text-textblack lg:bg-transparent">
          <div className="flex pl-10 lg:pl-0 flex-row">
            <Link
              target={"_blank"}
              href={`//${target.uri}`}
              onClick={(e) => e.stopPropagation()}
              rel="noopener"
              title={target.uri}
              className="text-ellipsis max-w-xs block"
            >
              {toUnicode(target.uri)}
            </Link>
            <div className="hidden lg:inline ml-2">
              <Tooltip tooltip={infoMessage(target)}>
                <FontAwesomeIcon
                  className="opacity-50"
                  icon={faQuestionCircle}
                />
              </Tooltip>
            </div>
          </div>
          {/*<div className="flex flex-row gap-2">
            {target.collections?.map((c) => {
              const col = collections[c.toString()];
              return <CollectionPill selected={true} key={col.id} {...col} />;
            })}
          </div>*/}
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
                <div className="px-4 py-2 lg:p-2 text-white lg:text-textblack h-8 w-8 flex flex-row h-full items-center justify-center">
                  {scanRequest.key === target.uri && scanRequest.isLoading ? (
                    <div className="absolute">
                      <Spinner />
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                  )}
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
                  <DropdownMenuItem onClick={() => destroy(target.uri)}>
                    Löschen
                  </DropdownMenuItem>
                  {/*!isGuest && (
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

                     
                    </>
                      )*/}
                </>
              }
            />
          </div>
        </td>
      </tr>
    </>
  );
};

export default TargetTableItem;
