import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EventEmitter from "events";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { useSignOut } from "../hooks/useSignOut";
import { classNames, clientOnly, isGuestUser } from "../utils/common";
import { useGlobalStore } from "../zustand/global";
import DropdownMenuItem from "./common/DropdownMenuItem";
import Menu from "./common/Menu";

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
  const store = useGlobalStore();

  const [scrolled, setScrolled] = useState(false);

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
    // add scroll listener
    window.addEventListener("scroll", listener);

    return () => {
      pageTitleNotVisibleEmitter.removeAllListeners("set-content");
      // remove scroll listener
      window.removeEventListener("scroll", listener);
    };
  }, []);

  return (
    <div
      className={classNames(
        "h-14 sticky top-0 z-10 transition-all duration-500 text-black ",
        "",
        !scrolled ? "bg-deepblue-600" : "bg-deepblue-300"
      )}
    >
      {session.status === "authenticated" && session.data && (
        <div className="flex flex-row items-center h-full">
          <div
            className={classNames(
              "flex bg-deepblue-500 transition-all border-deepblue-300 h-full items-center",
              store.sideMenuCollapsed ? "w-16" : "w-56"
            )}
          >
            <div className="px-4 flex gap-2 flex-row items-center text-white">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width={25}
                  height={45}
                  className="flex-1"
                  src={"/assets/sticker_challenge_mod_white_3.svg"}
                  alt="Logo OZG"
                />
              </Link>
              {!store.sideMenuCollapsed && (
                <span className="whitespace-nowrap font-bold">
                  OZG-Security-Challenge
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-1 max-w-screen-xl mx-auto flex-row justify-between items-center">
            <h2
              className={classNames(
                "text-white text-2xl font-bold transition duration-500",
                title === "" ? "opacity-0" : "opacity-100"
              )}
            >
              {title}
            </h2>
            <div className="ml-2 text-sm absolute z-200 right-2 text-white">
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
