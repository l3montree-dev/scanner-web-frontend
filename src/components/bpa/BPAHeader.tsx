"use client";

import { FunctionComponent, useState } from "react";
import { withAuthProvider } from "../../providers/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import { classNames } from "../../utils/common";
import { useGlobalStore } from "../../zustand/global";
import SideMenu from "../SideMenu";
import MenuButton from "../common/MenuButton";
import { getLinks } from "../links";
import Logo from "./Logo";
import SmallLink from "./SmallLink";
import { featureFlags } from "../../feature-flags";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useSearchParams } from "next/navigation";
import { useSignOut } from "../../hooks/useSignOut";

const BPAHeader: FunctionComponent = () => {
  const activeLink = usePathname();

  const signOut = useSignOut();

  const { user, session, hideLogin } = useGlobalStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const query = useSearchParams();

  return (
    <header className="z-50 sticky top-0 bg-zinc-950">
      <div className="container">
        <div className="flex flex-row flex-wrap justify-between items-center">
          <div className="my-8">
            <Link
              id="l3montree-link"
              data-umami-event="Go to l3montree homepage"
              href="https://l3montree.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                priority
                alt="L3montree Cybersecurity Logo"
                width={250}
                height={100}
                src="/assets/logo.svg"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default withAuthProvider(BPAHeader);
