import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EventEmitter from "events";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { useSignOut } from "../hooks/useSignOut";
import { classNames, clientOnly, isGuestUser } from "../utils/common";
import { useGlobalStore } from "../zustand/global";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";

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

  const signOut = useSignOut();

  useEffect(() => {
    pageTitleNotVisibleEmitter.on("set-content", (args) => {
      setTitle(args);
    });

    return () => {
      pageTitleNotVisibleEmitter.removeAllListeners("set-content");
    };
  }, []);

  return (
    <div
      className={classNames(
        "h-14 sticky top-0 z-200 border-b transition-all duration-500 text-black ",
        "bg-deepblue-700 border-deepblue-300 border-b"
      )}
    >
      {session.status === "authenticated" && session.data && (
        <div className="flex flex-row items-center h-full">
          <div
            className={classNames(
              "flex border-deepblue-500 bg-deepblue-700 h-full items-center"
            )}
          >
            <div className="px-4 flex gap-2 flex-row items-center text-white">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width={35}
                  height={45}
                  className="flex-1"
                  src={"/assets/sticker_challenge_mod_white_3.svg"}
                  alt="Logo OZG"
                />
              </Link>
              {!store.sideMenuCollapsed && (
                <span className="whitespace-nowrap">
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
                menuCloseIndex={0}
                Button={
                  <div className="bg-deepblue-100 rounded-full text-white h-9 w-9 flex items-center justify-center text-sm mr-1">
                    {getInitials(session.data.user.name)}
                  </div>
                }
                Menu={
                  <MenuList>
                    <MenuItem onClick={signOut}>
                      <FontAwesomeIcon
                        className="mr-2 text-white"
                        icon={faArrowRightFromBracket}
                      />
                      Ausloggen
                    </MenuItem>
                    {!isGuestUser(session.data.user) &&
                      clientOnly(() => (
                        <a
                          href={`${keycloakIssuer}/protocol/openid-connect/auth?client_id=quicktest&redirect_uri=${encodeURIComponent(
                            `${window.location.protocol}//${window.location.host}`
                          )}&response_type=code&scope=openid&kc_action=UPDATE_PASSWORD`}
                        >
                          <MenuItem>
                            <FontAwesomeIcon
                              className="mr-2 text-white"
                              icon={faArrowRightFromBracket}
                            />
                            Passwort ändern
                          </MenuItem>
                        </a>
                      ))}
                    <div className="p-2 text-white text-sm border-t border-t-deepblue-200 bg-deepblue-300">
                      Eingeloggt als:{" "}
                      {isGuestUser(session.data.user)
                        ? "Gast"
                        : session.data.user.name}
                    </div>
                  </MenuList>
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
