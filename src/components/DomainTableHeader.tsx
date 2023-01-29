import {
  faCaretDown,
  faCaretUp,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import React, { FunctionComponent } from "react";
import {
  OrganizationalInspectionType,
  TLSInspectionType,
  HeaderInspectionType,
  DomainInspectionType,
  NetworkInspectionType,
  InspectionType,
} from "../inspection/scans";
import { DetailedDomain } from "../types";
import { DTO } from "../utils/server";

import Checkbox from "./Checkbox";
import { SortButton } from "./SortButton";

interface Props {
  selectedFQDNs: string[];
  domains: DTO<DetailedDomain>[];
  setSelection: (
    fn: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  sort: {
    key: string;
    direction: -1 | 1;
  };
  handleSort: (key: InspectionType | "fqdn") => void;
}

const DomainTableHeader: FunctionComponent<Props> = ({
  selectedFQDNs,
  domains,
  setSelection,
  sort,
  handleSort,
}) => {
  const getIcon = (key: InspectionType | "fqdn") => {
    if (sort.key === key) {
      return sort.direction === 1 ? faCaretUp : faCaretDown;
    }
    return faCaretUp;
  };
  return (
    <div>
      <div className="bg-deepblue-200 flex font-bold flex-row items-center text-sm border-b border-b-deepblue-50 text-left">
        <div className="p-2 pr-0 basis-8">
          <Checkbox
            checked={
              selectedFQDNs.length > 0 &&
              selectedFQDNs.length === domains.length
            }
            onChange={() => {
              setSelection((prev) => {
                return domains.reduce((acc, domain) => {
                  acc[domain.fqdn] = !Boolean(prev[domain.fqdn]);
                  return acc;
                }, {} as Record<string, boolean>);
              });
            }}
          />
        </div>
        <div className="p-2 basis-2/16">
          <div>
            <span>Domain</span>
            <SortButton
              sortKey="fqdn"
              onSort={handleSort}
              active={sort.key === "fqdn"}
              getIcon={() => getIcon("fqdn")}
            />
          </div>
        </div>
        <div className="p-2 basis-2/16 flex items-center flex-row">
          <span title="Responsible Disclosure">Resp. Disc.</span>
          <SortButton
            sortKey={OrganizationalInspectionType.ResponsibleDisclosure}
            onSort={handleSort}
            active={
              sort.key === OrganizationalInspectionType.ResponsibleDisclosure
            }
            getIcon={() =>
              getIcon(OrganizationalInspectionType.ResponsibleDisclosure)
            }
          />
        </div>
        <div className="p-2 basis-2/16">
          <div>
            <span>TLS 1.3</span>
            <SortButton
              sortKey={TLSInspectionType.TLSv1_3}
              onSort={handleSort}
              active={sort.key === TLSInspectionType.TLSv1_3}
              getIcon={() => getIcon(TLSInspectionType.TLSv1_3)}
            />
          </div>
        </div>
        <div className="p-2 flex-row flex basis-2/16 items-center">
          <span title="Veraltete TLS/ SSL Protokolle deaktiviert">
            Alte TLS/SSL deak.
          </span>
          <SortButton
            sortKey={TLSInspectionType.TLSv1_1_Deactivated}
            onSort={handleSort}
            active={sort.key === TLSInspectionType.TLSv1_1_Deactivated}
            getIcon={() => getIcon(TLSInspectionType.TLSv1_1_Deactivated)}
          />
        </div>
        <div className="p-2 flex flex-row items-center relative basis-1/16">
          <div className="flex flex-row absolute items-center">
            <span className="whitespace-nowrap">HSTS</span>
            <SortButton
              sortKey={HeaderInspectionType.HSTS}
              onSort={handleSort}
              active={sort.key === HeaderInspectionType.HSTS}
              getIcon={() => getIcon(HeaderInspectionType.HSTS)}
            />
          </div>
        </div>
        <div className="p-2 basis-2/16 flex flex-row items-center">
          <span>DNSSEC</span>
          <SortButton
            sortKey={DomainInspectionType.DNSSec}
            onSort={handleSort}
            active={sort.key === DomainInspectionType.DNSSec}
            getIcon={() => getIcon(DomainInspectionType.DNSSec)}
          />
        </div>
        <div className="p-2 basis-2/16">
          <div>
            <span className="whitespace-nowrap">RPKI</span>
            <SortButton
              sortKey={NetworkInspectionType.RPKI}
              onSort={handleSort}
              active={sort.key === NetworkInspectionType.RPKI}
              getIcon={() => getIcon(NetworkInspectionType.RPKI)}
            />
          </div>
        </div>
        <div className="p-2 basis-2/16">
          <div>
            <span>Tags</span>
          </div>
        </div>
        <div className="p-2 basis-1/16">
          <div>
            <span>Aktionen</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainTableHeader;
