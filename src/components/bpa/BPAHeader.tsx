import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent, useEffect, useState } from "react";
import SmallLink from "./SmallLink";
import { useRouter } from "next/router";
import { classNames } from "../../utils/common";
import Logo from "./Logo";
import { useSession } from "next-auth/react";
import { useSignOut } from "../../hooks/useSignOut";

interface Props {
  hideLogin?: boolean;
}

const BPAHeader: FunctionComponent<Props> = ({ hideLogin }) => {
  const activeLink = useRouter().pathname;

  const session = useSession();
  const router = useRouter();
  const signOut = useSignOut();

  return (
    <header className="border-t-10 z-50 bg-white sticky top-0 border-b-6 border-b-hellgrau-40  border-t-bund">
      <div className="container">
        <div className="flex flex-row justify-between items-center">
          <Logo />
          <div>
            <nav className="flex flex-row justify-end">
              {!Boolean(hideLogin) && (
                <>
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
                </>
              )}
            </nav>
            <nav className="text-gray-600 pt-2 flex flex-row justify-end gap-10">
              <Link
                className={classNames(
                  activeLink === "/" ? "text-bund" : "text-textblack",
                  "hover:text-bund"
                )}
                href="/"
              >
                Schnelltest
              </Link>
              <Link
                className={classNames(
                  activeLink === "/info" ? "text-bund" : "text-textblack",
                  "hover:text-bund"
                )}
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
