import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import { useSession } from "../hooks/useSession";
import { clientOnly } from "../utils/common";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

const Header: FunctionComponent<{ keycloakIssuer: string }> = ({
  keycloakIssuer,
}) => {
  const session = useSession();

  const handleSignOut = async () => {
    const res: { path: string } = await (
      await fetch("/api/auth/kc-signout")
    ).json();
    await signOut({
      redirect: false,
    });
    window.location.href = res.path;
  };
  return (
    <div className="bg-deepblue-700 h-14 border-b text-black border-deepblue-300">
      {session.status === "authenticated" && session.data && (
        <div className="flex flex-row items-center h-full">
          <div className="flex w-56 border-r border-deepblue-500 bg-white h-full items-center">
            <div className="px-4">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width={65}
                  height={55}
                  src={"/assets/ozg-logo-colored.svg"}
                  alt="Logo OZG"
                />
              </Link>
            </div>
          </div>
          <div className="flex flex-1 px-2 flex-row justify-end items-center">
            <div className="ml-2 text-sm text-white">
              <Menu
                Button={
                  <div className="bg-deepblue-100 rounded-full text-white h-9 w-9 flex items-center justify-center text-sm mr-1">
                    {getInitials(session.data.user.name)}
                  </div>
                }
                Menu={
                  <MenuList>
                    <MenuItem onClick={handleSignOut}>
                      <FontAwesomeIcon
                        className="mr-2 text-white"
                        icon={faArrowRightFromBracket}
                      />
                      Ausloggen
                    </MenuItem>
                    {clientOnly(() => (
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
                      Eingeloggt als: {session.data.user.name}
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
