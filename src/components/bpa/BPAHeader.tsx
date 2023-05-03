import Image from "next/image";
import Link from "next/link";
import React from "react";
import SmallLink from "./SmallLink";
import { useRouter } from "next/router";
import { classNames } from "../../utils/common";
import Logo from "./Logo";

const BPAHeader = () => {
  const activeLink = useRouter().pathname;
  return (
    <header className="pt-4 border-t-10 z-50 bg-white sticky top-0 border-b-6 border-b-hellgrau-20 border-t-bund">
      <div className="container">
        <div className="flex flex-row pb-4 justify-between items-start">
          <Logo />
          <div>
            <nav className="flex flex-row justify-end">
              <ul>
                <li>
                  <SmallLink href="/dashboard">Anmelden</SmallLink>
                </li>
              </ul>
            </nav>
            <nav className="text-gray-600 pt-2 flex flex-row justify-end gap-10">
              <Link
                className={classNames(activeLink === "/" && "text-bund")}
                href="/"
              >
                Schnelltest
              </Link>
              <Link
                className={classNames(activeLink === "/info" && "text-bund")}
                href="/info"
              >
                Informationen zur Challenge
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BPAHeader;
