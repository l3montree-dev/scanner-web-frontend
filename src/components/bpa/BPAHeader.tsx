import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useState } from "react";
import { useSignOut } from "../../hooks/useSignOut";
import { classNames } from "../../utils/common";
import SideMenu from "../SideMenu";
import Logo from "./Logo";
import SmallLink from "./SmallLink";
import MenuButton from "../MenuButton";

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
                        className="uppercase hover:border-b border-b-transparent hover:border-b-blau-100 cursor-pointer font-bold text-xs hover:text-blau-100 text-dunkelgrau-100"
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
                      "hover:text-blau-100"
                    )}
                    href={`/?${query}`}
                  >
                    Schnelltest
                  </Link>
                  <Link
                    className={classNames(
                      activeLink === "/info" ? "text-bund" : "text-textblack",
                      "hover:text-blau-100"
                    )}
                    href={`/info?${query}`}
                  >
                    Informationen zur Challenge
                  </Link>
                </nav>
              </div>
              <div className="block ml-auto lg:hidden">
                <MenuButton setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
                <SideMenu
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen((prev) => !prev)}
                >
                  <div>
                    <nav className="flex flex-col">
                      <Link
                        className={classNames(
                          "py-3",
                          activeLink === "/" ? "text-bund" : "text-textblack",
                          "hover:text-blau-100"
                        )}
                        href={`/?${query}`}
                      >
                        Schnelltest
                      </Link>
                      <Link
                        className={classNames(
                          "py-3",
                          activeLink === "/info"
                            ? "text-bund"
                            : "text-textblack",
                          "hover:text-bund"
                        )}
                        href={`/info?${query}`}
                      >
                        Informationen zur Challenge
                      </Link>
                      {session.status === "authenticated" ? (
                        <div className="flex flex-col">
                          <Link className="py-3" href="/dashboard">
                            Dashboard
                          </Link>
                          <span
                            className="font-medium cursor-pointer py-3 hover:text-blau-100 hover:underline"
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
