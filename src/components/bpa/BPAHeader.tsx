import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent, useEffect, useState } from "react";
import SmallLink from "./SmallLink";
import { useRouter } from "next/router";
import { classNames } from "../../utils/common";
import Logo from "./Logo";
import { useSession } from "next-auth/react";
import { useSignOut } from "../../hooks/useSignOut";
import SideMenu from "../SideMenu";

interface Props {
  hideLogin?: boolean;
}

const BPAHeader: FunctionComponent<Props> = ({ hideLogin }) => {
  const activeLink = useRouter().pathname;

  const session = useSession();
  const router = useRouter();
  const signOut = useSignOut();

  const [menuOpen, setMenuOpen] = useState(false);

  const query = new URLSearchParams(
    router.query as Record<string, string>
  ).toString();

  return (
    <header className="border-t-10 z-50 bg-white sticky top-0 border-b-6 border-b-hellgrau-40  border-t-bund">
      <div className="container">
        <div className="flex flex-row flex-wrap justify-between items-center">
          <Logo />
          {!Boolean(hideLogin) && (
            <>
              <div className="hidden lg:block">
                <nav className="flex flex-row justify-end">
                  {session.status === "authenticated" ? (
                    <div className="flex flex-row gap-5">
                      <SmallLink href="/dashboard">Dashboard</SmallLink>
                      <span
                        className="uppercase hover:underline cursor-pointer font-bold text-sm text-dunkelgrau-100"
                        onClick={() => {
                          return signOut();
                        }}
                      >
                        Abmelden
                      </span>
                    </div>
                  ) : (
                    <SmallLink href="/dashboard">Anmelden</SmallLink>
                  )}
                </nav>
                <nav className="text-gray-600 pt-2 flex flex-row justify-end gap-10">
                  <Link
                    className={classNames(
                      activeLink === "/" ? "text-bund" : "text-textblack",
                      "hover:text-bund"
                    )}
                    href={`/?${query}`}
                  >
                    Schnelltest
                  </Link>
                  <Link
                    className={classNames(
                      activeLink === "/info" ? "text-bund" : "text-textblack",
                      "hover:text-bund"
                    )}
                    href={`/info?${query}`}
                  >
                    Informationen zur Challenge
                  </Link>
                </nav>
              </div>
              <div className="block ml-auto lg:hidden">
                <button
                  className="w-6 text-blau-100 flex flex-row justify-center items-center fill-current"
                  onClick={() => {
                    setMenuOpen((prev) => !prev);
                  }}
                >
                  {menuOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5"
                      viewBox="0 0 14 14"
                    >
                      <path
                        d="m8.4 7 5.4-5.4a.2.2 0 0 0 0-.3l-1-1a.2.2 0 0 0-.4 0L7 5.5 1.6.2a.2.2 0 0 0-.3 0l-1 1a.2.2 0 0 0 0 .4L5.5 7 .2 12.4a.2.2 0 0 0 0 .3l1 1a.2.2 0 0 0 .4 0L7 8.5l5.4 5.4a.2.2 0 0 0 .3 0l1-1a.2.2 0 0 0 0-.4Z"
                        data-name="close"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14">
                      <g data-name="menu">
                        <rect
                          x="1"
                          y="1"
                          width="18"
                          height="2"
                          rx=".3"
                          ry=".3"
                        />
                        <rect
                          x="1"
                          y="6"
                          width="18"
                          height="2"
                          rx=".3"
                          ry=".3"
                        />
                        <rect
                          x="1"
                          y="11"
                          width="18"
                          height="2"
                          rx=".3"
                          ry=".3"
                        />
                      </g>
                    </svg>
                  )}
                </button>
                <SideMenu
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen((prev) => !prev)}
                >
                  <div>
                    <nav className="flex flex-col gap-5">
                      <Link
                        className={classNames(
                          "border-b border-b-hellgrau-100 pb-5",
                          activeLink === "/" ? "text-bund" : "text-textblack",
                          "hover:text-bund"
                        )}
                        href={`/?${query}`}
                      >
                        Schnelltest
                      </Link>
                      <Link
                        className={classNames(
                          "border-b border-b-hellgrau-100 py-3",
                          activeLink === "/info"
                            ? "text-bund"
                            : "text-textblack",
                          "hover:text-bund"
                        )}
                        href={`/info?${query}`}
                      >
                        Informationen zur Challenge
                      </Link>
                    </nav>
                  </div>
                </SideMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default BPAHeader;
