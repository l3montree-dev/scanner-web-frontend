import {
  faEllipsisVertical,
  faPlus,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import useLoading from "../hooks/useLoading";
import { DetailedDomain } from "../types";
import { classNames } from "../utils/common";
import { DTO } from "../utils/server";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";
import ResultIcon from "./ResultIcon";
import Tooltip from "./Tooltip";

const colors = ["#eab308", "#f97316", "#84cc16", "#0d9488", "#ef4444"];

interface Props {
  domain: DTO<DetailedDomain>;
  i: number;
  totalElements: number;
  select: (fqdn: string) => void;

  selection: Record<string, boolean>;
  scanRequest: ReturnType<typeof useLoading>;
  deleteFQDN: (fqdn: string) => void;
  scanFQDN: (fqdn: string) => void;
}
const DomainTableItem: FunctionComponent<Props> = ({
  domain,
  i,
  select,
  selection,
  deleteFQDN,
  scanFQDN,
  totalElements,
  scanRequest,
}) => {
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(colors[0]);
  return (
    <div
      className={classNames(
        "cursor-pointer",
        i !== totalElements - 1 && "border-b",
        "border-b-deepblue-300 transition-all",
        domain.errorCount !== null && domain.errorCount >= 5
          ? "line-through"
          : "",
        selection[domain.fqdn]
          ? "bg-deepblue-200"
          : i % 2 === 0
          ? "bg-deepblue-400"
          : "bg-deepblue-500"
      )}
    >
      <div className={"flex flex-row items-center"} key={domain.fqdn}>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 pr-0"
        >
          <div className="flex flex-row items-center">
            <Checkbox
              onChange={() => {
                select(domain.fqdn);
              }}
              checked={Boolean(selection[domain.fqdn])}
            />
          </div>
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-2/16"
        >
          {domain.fqdn}
          <div
            onClick={() => {
              select(domain.fqdn);
            }}
            className="inline ml-2"
          >
            <Tooltip
              tooltip={
                domain.lastScan !== null
                  ? `Letzter Scan: ${new Date(
                      domain.lastScan
                    ).toLocaleString()}${
                      domain.errorCount !== null && domain.errorCount > 0
                        ? ` (${domain.errorCount} Fehler)`
                        : ""
                    }${
                      domain.errorCount !== null && domain.errorCount >= 5
                        ? " Domain wird nicht mehr automatisiert gescanned, da 5 Fehler überschritten wurden"
                        : ""
                    }`
                  : "Noch nicht gescannt"
              }
            >
              <FontAwesomeIcon className="opacity-50" icon={faQuestionCircle} />
            </Tooltip>
          </div>
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-2/16"
        >
          <ResultIcon
            didPass={domain.details?.ResponsibleDisclosure?.didPass}
          />
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-2/16"
        >
          <ResultIcon didPass={domain.details?.TLSv1_3?.didPass} />
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-2/16"
        >
          <ResultIcon didPass={domain.details?.TLSv1_1_Deactivated?.didPass} />
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-1/16"
        >
          <ResultIcon didPass={domain.details?.HSTS?.didPass} />
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-2/16"
        >
          <ResultIcon didPass={domain.details?.DNSSec?.didPass} />
        </div>
        <div
          onClick={() => {
            select(domain.fqdn);
          }}
          className="p-2 basis-2/16"
        >
          <ResultIcon didPass={domain.details?.RPKI?.didPass} />
        </div>
        <div className="flex flex-row p-2 basis-2/16 flex-wrap gap-1">
          {["Steuern", "OZG"].map((item) => (
            <div
              className="border text-xs border-deepblue-50 text-slate-200 bg-deepblue-100 px-2 py-1 flex-row flex items-center justify-center rounded-full"
              key={item}
            >
              <span>{item}</span>
            </div>
          ))}
          <Menu
            menuCloseIndex={0}
            Button={
              <div className="border transition-all border-deepblue-50 hover:bg-deepblue-100 text-slate-200 flex flex-row items-center w-7 h-7 justify-center rounded-full">
                <FontAwesomeIcon icon={faPlus} />
              </div>
            }
            Menu={
              <MenuList>
                <div className="p-2">
                  <div className="flex items-center line-height-0 flex-row">
                    <Menu
                      menuCloseIndex={1}
                      Button={
                        <div
                          className="w-9 mr-1 h-9 rounded-sm"
                          style={{ backgroundColor: tagColor }}
                        />
                      }
                      Menu={
                        <div className="flex mb-2 bg-deepblue-50 p-2 flex-wrap gap-1 justify-start items-center">
                          {colors.map((color) => (
                            <div
                              onClick={() => setTagColor(color)}
                              key={color}
                              className="w-9 h-9 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      }
                    />
                    <input
                      placeholder="Neues Tag erstellen"
                      className="px-3 py-2 text-sm outline-lightning-500 text-deepblue-500 w-56"
                    />
                  </div>
                  <div className="flex text-sm flex-row justify-end">
                    <Button
                      className="bg-lightning-500 font-bold text-deepblue-500 hover:bg-lightning-800 transition-all px-3 py-2 mt-2 text-center"
                      loading={false}
                      type="submit"
                    >
                      Erstellen
                    </Button>
                  </div>
                </div>
              </MenuList>
            }
          />
        </div>
        <div className="text-right basis-1/16 p-2">
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
                    scanRequest.key === domain.fqdn && scanRequest.isLoading
                  }
                  onClick={() => scanFQDN(domain.fqdn)}
                >
                  <div>
                    <div>Erneut scannen</div>
                    {scanRequest.key === domain.fqdn && (
                      <span className="block text-red-500 text-sm">
                        {scanRequest.errorMessage}
                      </span>
                    )}
                  </div>
                </MenuItem>
                <MenuItem onClick={() => deleteFQDN(domain.fqdn)}>
                  <div>Löschen</div>
                </MenuItem>
              </MenuList>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DomainTableItem;
