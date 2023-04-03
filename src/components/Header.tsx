import {
  faArrowRightFromBracket,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Portal from "@radix-ui/react-portal";
import EventEmitter from "events";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { useSignOut } from "../hooks/useSignOut";
import { classNames, clientOnly, isGuestUser } from "../utils/common";
import DropdownMenuItem from "./common/DropdownMenuItem";
import Menu from "./common/Menu";
import SideNavigation from "./SideNavigation";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

export const pageTitleNotVisibleEmitter = new EventEmitter();

const Header: FunctionComponent<{ keycloakIssuer: string }> = ({
  keycloakIssuer,
}) => {
  const session = useSession();

  const [title, setTitle] = useState("");

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  const router = useRouter();

  const signOut = useSignOut();

  useEffect(() => {
    pageTitleNotVisibleEmitter.on("set-content", (args) => {
      setTitle(args);
    });
    const listener = () => {
      if (window.scrollY > 0 && !scrolled) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    listener();
    // add scroll listener
    window.addEventListener("scroll", listener);

    return () => {
      pageTitleNotVisibleEmitter.removeAllListeners("set-content");
      // remove scroll listener
      window.removeEventListener("scroll", listener);
    };
  }, []);

  const openMenu = () => {
    setMobileMenuIsOpen(true);
    // stop scrolling
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    setMobileMenuIsOpen(false);
    // allow scrolling
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, [router.pathname]);

  return (
    <div
      className={classNames(
        "h-14 sticky top-0 z-20 transition-all shadow-lg duration-500 text-black ",
        "",
        !scrolled ? "bg-deepblue-600" : "bg-deepblue-300"
      )}
    >
      {session.status === "authenticated" && session.data && (
        <div className="flex flex-row items-center h-full">
          <div className="flex flex-1 max-w-screen-xl mx-auto px-3 flex-row justify-between items-center">
            <h2
              className={classNames(
                "text-white text-2xl font-bold transition duration-500",
                title === "" ? "opacity-0" : "opacity-100"
              )}
            >
              {title}
            </h2>
            <div className="block text-white lg:hidden">
              <button className="p-3" onClick={openMenu}>
                <FontAwesomeIcon icon={faBars} />
              </button>
              <Portal.Root>
                <div
                  className={classNames(
                    "fixed bottom-0 left-0 right-0 transition-all bg-black/50 z-100 top-0",
                    mobileMenuIsOpen
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-0"
                  )}
                >
                  <div
                    className={classNames(
                      "bg-deepblue-400 absolute right-0 top-0 bottom-0 transition-all",
                      mobileMenuIsOpen ? "translate-x-0" : "translate-x-full"
                    )}
                  >
                    <div className="px-4 py-1 flex flex-row justify-end">
                      <button className="p-3" onClick={closeMenu}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <SideNavigation />
                  </div>
                </div>
              </Portal.Root>
            </div>
            <div className="ml-2 text-sm absolute z-200 hidden lg:block right-2 text-white">
              <Menu
                Button={
                  <div className="bg-deepblue-100 cursor-pointer rounded-full h-9 w-9 flex items-center justify-center text-sm mr-1">
                    {getInitials(session.data.user.name)}
                  </div>
                }
                Menu={
                  <>
                    <DropdownMenuItem
                      Icon={
                        <FontAwesomeIcon
                          className="mr-2"
                          icon={faArrowRightFromBracket}
                        />
                      }
                      onClick={signOut}
                    >
                      Ausloggen
                    </DropdownMenuItem>
                    {!isGuestUser(session.data.user) &&
                      clientOnly(() => (
                        <a
                          className="hover:no-underline"
                          href={`${keycloakIssuer}/protocol/openid-connect/auth?client_id=quicktest&redirect_uri=${encodeURIComponent(
                            `${window.location.protocol}//${window.location.host}`
                          )}&response_type=code&scope=openid&kc_action=UPDATE_PASSWORD`}
                        >
                          <DropdownMenuItem
                            Icon={
                              <FontAwesomeIcon icon={faArrowRightFromBracket} />
                            }
                          >
                            Passwort ändern
                          </DropdownMenuItem>
                        </a>
                      ))}
                    <div className="p-2 relative top-1 text-white text-sm border-t border-t-deepblue-200 bg-deepblue-300">
                      Eingeloggt als:{" "}
                      {isGuestUser(session.data.user)
                        ? "Gast"
                        : session.data.user.name}
                    </div>
                  </>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
