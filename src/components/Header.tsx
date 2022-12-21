import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  const handleSignOut = () => {};
  return (
    <div className="bg-deepblue-300 h-14 border-b text-white border-deepblue-50">
      {session.status === "authenticated" && session.data && (
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <div className="text-xl font-bold">OZG Security</div>
          </div>
          <div className="flex items-center">
            <div className="ml-2">
              <Menu
                Button={
                  <div className="bg-lightning-900 text-black rounded-full h-9 w-9 flex items-center justify-center">
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
                    <div className="p-2 text-sm border-t border-t-deepblue-50 bg-deepblue-300">
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
