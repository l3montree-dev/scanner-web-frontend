import Link from "next/link";
import React, { FunctionComponent, useState } from "react";
import { IReport } from "../db/report";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  HeaderInspectionType,
  InspectionType,
  TLSInspectionType,
} from "../inspection/Inspector";
import {
  faCaretDown,
  faCaretUp,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { classNames } from "../utils/style-utils";

interface MenuItem {
  title: string;
  hash: string;
  inspectionTypes: InspectionType[];
}

interface MenuGroup {
  title: string;
  elements: MenuItem[];
}

interface Section {
  title: string;
  groups: Array<MenuGroup | MenuItem>;
}
const sections: Array<Section> = [
  {
    title: "WWW",
    groups: [
      {
        title: "Modern security features",
        elements: [
          {
            title: "HSTS",
            hash: "hsts",
            inspectionTypes: [HeaderInspectionType.HSTS],
          },
        ],
      },
      {
        title: "Secure Transport",
        elements: [
          {
            title: "TLS",
            hash: "tls",
            inspectionTypes: [TLSInspectionType.TLSv1_3],
          },
        ],
      },
    ],
  },
];

const Item: React.FC<MenuItem & { didPass: boolean }> = (props) => {
  return (
    <Link scroll={true} key={props.hash} href={`#${props.hash}`}>
      <a className="hover:bg-deepblue-100 transition-all px-7 justify-between items-center flex flex-row w-full p-2 block">
        <div>
          <FontAwesomeIcon
            className="mr-4"
            icon={props.didPass ? faCheck : faTimes}
          />
          <span>{props.title}</span>
        </div>

        <div
          className={classNames(
            props.didPass ? "bg-green-500" : "bg-red-500",
            "w-3 h-3 rounded-sm"
          )}
        />
      </a>
    </Link>
  );
};

const SectionGroup: FunctionComponent<
  Section & { didPass: (inspectionTypes: InspectionType[]) => boolean }
> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="bg-deepblue-300 border-b border-t border-deepblue-200 py-2"
      key={props.title}
    >
      <div className="flex flex-row justify-between pl-5 pr-4 items-center">
        <h2 className="text-2xl font-bold">{props.title} </h2>
        <button
          className="hover:bg-deepblue-100 rounded-md w-8 h-8 opacity-75 hover:opacity-100 transition-all"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <FontAwesomeIcon
            size={"lg"}
            icon={isOpen ? faCaretUp : faCaretDown}
          />
        </button>
      </div>
      <div
        className="overflow-hidden"
        style={{ height: isOpen ? "auto" : "0px" }}
      >
        {props.groups.map((groupOrItem, index, arr) => {
          if ("elements" in groupOrItem) {
            // is group
            return (
              <div className="mt-5" key={groupOrItem.title}>
                <span className="opacity-75 px-5 text-sm">
                  {groupOrItem.title}
                </span>
                <div className={classNames(index + 1 !== arr.length && "mb-5")}>
                  {groupOrItem.elements.map((element) => {
                    return (
                      <Item
                        key={element.title}
                        {...element}
                        didPass={props.didPass(element.inspectionTypes)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          } else {
            return (
              <Item
                key={groupOrItem.title}
                {...groupOrItem}
                didPass={props.didPass(groupOrItem.inspectionTypes)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};
const SideNav: FunctionComponent<IReport> = (props) => {
  const didPass = (inspections: InspectionType[]) => {
    return inspections.every((inspection) => props.result[inspection].didPass);
  };
  const date = new Date(props.createdAt);
  return (
    <nav className="text-white pb-5 bg-deepblue-400">
      <div className="mb-5">
        <div className="px-5 flex flex-row items-center">
          <Image
            alt="OZG Logo"
            src={"/assets/ozg-logo.svg"}
            width={45}
            height={45}
          />
          <span className="ml-4">Website Scanner</span>
        </div>
        <div className="px-5 py-3 border-deepblue-100 items-center flex flex-row">
          {props.iconBase64 && (
            <div className="p-1 rounded-xl bg-white flex mr-4 flex-row items-center justify-center">
              <div className="flex flex-row items-center justify-center">
                <Image
                  src={props.iconBase64}
                  width={45}
                  height={45}
                  alt={`${props.fqdn} icon`}
                />
              </div>
            </div>
          )}

          <div>
            <h2 className="text-3xl font-bold">{props.fqdn}</h2>
            <p className="opacity-75 text-sm">
              {date
                .toLocaleString()
                .substring(0, date.toLocaleString().length - 3)}
            </p>
          </div>
        </div>
      </div>
      {sections.map((section) => {
        return (
          <SectionGroup key={section.title} {...section} didPass={didPass} />
        );
      })}
    </nav>
  );
};

export default SideNav;
