import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Dialog from "./Dialog";
import Imprint from "./Imprint";

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();

  return (
    <>
      <footer className="bg-white md:text-md text-sm px-5 md:px-10 pb-10">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={255}
            height={156}
            src={"/assets/bmi-logo.svg"}
            alt="Logo BMI"
          />
        </div>
        <div className="lg:flex justify-between">
          <div className="flex flex-wrap flex-row mb-0">
            <span className="mr-4">
              <button
                onClick={() => setIsOpen(true)}
                className="cursor-pointer p-2"
                type="button"
              >
                Impressum
              </button>
            </span>
            <span className="mr-4">
              <a
                href="https://www.bmi.bund.de/DE/service/datenschutz/datenschutz_node.html"
                target="_blank"
                className="p-2 block"
                rel="noopener noreferrer"
              >
                Datenschutz
              </a>
            </span>
            <span>
              <a
                href="https://www.onlinezugangsgesetz.de/"
                rel="noopener noreferrer"
                className="p-2 block"
                target={"_blank"}
              >
                Onlinezugangsgesetz.de
              </a>
            </span>
          </div>
          <div className="p-2 flex-row flex">
            <div className="mr-2">
              {session.status === "authenticated" ? (
                <>
                  <Link className="mr-2" href="/dashboard">
                    Dashboard
                  </Link>
                  <span className="cursor-pointer" onClick={() => signOut()}>
                    Logout
                  </span>
                </>
              ) : (
                <Link href="/dashboard">Login</Link>
              )}
            </div>
            <span>© Bundesministerium des Innern und für Heimat, 2022</span>
          </div>
        </div>
      </footer>
      <Dialog onClose={() => setIsOpen(false)} isOpen={isOpen}>
        <Imprint />
      </Dialog>
    </>
  );
};

export default Footer;
