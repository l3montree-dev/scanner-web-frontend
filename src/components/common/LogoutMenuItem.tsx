"use client";

import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { signOut } from "next-auth/react";
import React from "react";
import DropdownMenuItem from "./DropdownMenuItem";

const LogoutMenuItem = () => {
  return (
    <DropdownMenuItem
      Icon={<FontAwesomeIcon icon={faArrowRightFromBracket} />}
      onClick={() => signOut()}
    >
      Ausloggen
    </DropdownMenuItem>
  );
};

export default LogoutMenuItem;
