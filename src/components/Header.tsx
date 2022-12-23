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
    <div className="bg-deepblue-500 h-14 border-b text-white border-deepblue-500">
      {session.status === "authenticated" && session.data && (
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                width={70}
                height={50}
                src={"/assets/ozg-logo.svg"}
                alt="Logo BMI"
              />
              <div className="text-xl font-bold ml-2 relative top-1">
                Security
              </div>
            </Link>
          </div>
          <div className="flex items-center">
            <div className="ml-2">
              <Menu
                Button={
                  <div className="bg-white text-black rounded-full h-8 w-8 flex items-center justify-center">
                    {getInitials(session.data.user.name)}
                  </div>
                }
                Menu={
                  <MenuList>
                    <MenuItem onClick={handleSignOut}>
                      <FontAwesomeIcon
                        className="mr-2"
                        icon={faArrowRightFromBracket}
                      />
                      Ausloggen
                    </MenuItem>
                    <div className="p-2 text-sm border-t border-t-deepblue-200 bg-deepblue-300">
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
