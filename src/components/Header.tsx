import {
  faArrowRightFromBracket,
  faBars,
  faEnvelope,
  faHeadset,
  faKey,
  faPhone,
  faUserAstronaut,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EventEmitter from "events";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { useSignOut } from "../hooks/useSignOut";
import { classNames, clientOnly, isGuestUser } from "../utils/common";
import SideMenu from "./SideMenu";
import SideNavigation from "./SideNavigation";
import Tooltip from "./Tooltip";
import DropdownMenuItem from "./common/DropdownMenuItem";
import Menu from "./common/Menu";

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
        "h-20 sticky top-0 z-20 transition-all duration-500 text-textblack border-b-6 border-b-hellgrau-40",
        "bg-white"
      )}
    >
      {session.status === "authenticated" && session.data && (
        <div className="flex flex-row items-center h-full">
          <div className="flex flex-1 px-8 max-w-screen-2xl mx-auto flex-row justify-between items-center">
            <h2
              className={classNames(
                "text-textblack text-xl font-bold transition duration-500",
                title === "" ? "opacity-0" : "opacity-100"
              )}
            >
              {title}
            </h2>
            <div className="block text-white lg:hidden">
              <button className="p-3" onClick={openMenu}>
                <FontAwesomeIcon icon={faBars} />
              </button>
              <SideMenu isOpen={mobileMenuIsOpen} onClose={closeMenu}>
                <SideNavigation />
              </SideMenu>
            </div>
            <div className="ml-2 text-sm absolute z-200 hidden lg:block right-2 text-white">
              <div className="flex flex-row gap-5 items-center">
                <Tooltip
                  tooltip={
                    <div className="grid gap-2 text-sm">
                      <div className="flex flex-col font-semibold">
                        <span>Fragen zur Challenge oder zum Dashboard?</span>
                        <span className="">Hier wird Ihnen geholfen!</span>
                      </div>
                      <div className="pb-2 flex flex-col gap-4">
                        <div
                          key="sprechstunde"
                          className="flex items-start gap-x-3"
                        >
                          <FontAwesomeIcon
                            className="h-7 w-7 pt-2 flex-none"
                            icon={faPhone}
                          />
                          <span>
                            <a
                              href="tel:+4920878012422"
                              className="text-blau-100"
                            >
                              0208 78012422
                            </a>
                            <br />
                            Sprechstunde
                            <br /> (Mi. 10:00 - 12:00 Uhr)
                          </span>
                        </div>
                        <div
                          key="one-pager"
                          className="flex items-start gap-x-3"
                        >
                          <FontAwesomeIcon
                            className="h-7 w-7 pt-2 flex-none"
                            icon={faEnvelope}
                          />
                          <span>
                            <a
                              href="mailto:ozgsec@bmi.bund.de"
                              className="text-blau-100"
                            >
                              ozgsec@bmi.bund.de
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="flex cursor-pointer text-sm text-textblack flex-row gap-2">
                    <FontAwesomeIcon size="xl" icon={faHeadset} />
                  </div>
                </Tooltip>

                <Menu
                  Button={
                    <div className="bg-hellgrau-60 text-textblack overflow-hidden cursor-pointer rounded-full h-9 w-9 flex items-center justify-center text-xs mr-1">
                      <FontAwesomeIcon
                        size={"2xl"}
                        className="relative -bottom-1.5"
                        icon={faUserAstronaut}
                      />
                    </div>
                  }
                  Menu={
                    <>
                      <DropdownMenuItem
                        Icon={
                          <FontAwesomeIcon icon={faArrowRightFromBracket} />
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
                              Icon={<FontAwesomeIcon icon={faKey} />}
                            >
                              Passwort ändern
                            </DropdownMenuItem>
                          </a>
                        ))}
                      <div className="p-2 relative top-1 border-t border-t-deepblue-200 bg-hellgrau-100 text-textblack">
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
        </div>
      )}
    </div>
  );
};

export default Header;
