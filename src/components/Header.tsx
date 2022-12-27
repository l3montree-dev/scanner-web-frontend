import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useSession } from "../hooks/useSession";
import Menu from "./Menu";
import MenuItem from "./MenuItem";
import MenuList from "./MenuList";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
};

const Header = () => {
  const session = useSession();
  const router = useRouter();

  const handleSignOut = () => {
    signOut({
      redirect: false,
    });
    router.push("/");
  };
  return (
    <div className="bg-deepblue-700 h-14 border-b text-black border-deepblue-200">
      {session.status === "authenticated" && session.data && (
        <div className="flex flex-row items-center h-full">
          <div className="flex w-56 border-r border-deepblue-500 bg-white h-full items-center">
            <div className="px-4">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  width={55}
                  height={55}
                  src={"/assets/ozg-logo-colored.svg"}
                  alt="Logo BMI"
                />
              </Link>
            </div>
          </div>
          <div className="flex flex-1 px-4 flex-row justify-end items-center">
            <div className="ml-2 text-white">
              <Menu
                Button={
                  <div className="bg-deepblue-100 rounded-full text-white h-10 w-10 flex items-center justify-center">
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
