"use client";

import React, { useEffect, useState } from "react";
import MenuButton from "./common/MenuButton";
import SideMenu from "./SideMenu";
import SideNavigation from "./SideNavigation";
import { useSignOut } from "../hooks/useSignOut";
import { usePathname, useRouter } from "next/navigation";

const MobileMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

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
  }, [pathname]);

  const signOut = useSignOut();
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);

  return (
    <>
      <MenuButton setMenuOpen={openMenu} menuOpen={mobileMenuIsOpen} />
      <SideMenu isOpen={mobileMenuIsOpen} onClose={closeMenu}>
        <SideNavigation />
        <div className="mt-5">
          <a onClick={signOut} role="button">
            Ausloggen
          </a>
        </div>
      </SideMenu>
    </>
  );
};

export default MobileMenu;
