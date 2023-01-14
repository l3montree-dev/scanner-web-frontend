import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Imprint from "./Imprint";
import Modal from "./Modal";

const Footer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();

  return (
    <>
      <footer className="bg-white md:text-md text-sm px-5 md:px-10 pb-10">
        <div className="sm:flex flex-wrap justify-between flex-row p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flex flex-row">
            <img width={200} src={"/assets/bmi-logo.svg"} alt="Logo BMI" />
            {/*  <img
              width={214}
              className="ml-5"
              src={"/assets/bsi-logo.svg"}
              alt="Logo BSI"
          /> */}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={120}
            className="sm:ml-5 ml-0 mt-5 sm:mt-0"
            src={"/assets/ozg-logo-colored.svg"}
            alt="OZG Logo"
          />
        </div>
        <div className="lg:flex justify-between">
          <div className="flex flex-wrap flex-row mb-0">
            <span className="mr-4">
              <button
                onClick={() => setIsOpen(true)}
                className="cursor-pointer hover:underline p-2"
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
          <div className="p-2 flex-row flex-wrap sm:flex">
            <div className="mr-2">
              {session.status === "authenticated" ? (
                <>
                  <Link className="mr-2" href="/dashboard">
                    Dashboard
                  </Link>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => signOut()}
                  >
                    Logout
                  </span>
                </>
              ) : (
                <Link href="/dashboard">Login</Link>
              )}
            </div>
            <span className="mt-5 sm:mt-0">
              © Bundesministerium des Innern und für Heimat, 2022
            </span>
          </div>
        </div>
      </footer>
      <Modal title="Impressum" onClose={() => setIsOpen(false)} isOpen={isOpen}>
        <Imprint />
      </Modal>
    </>
  );
};

export default Footer;
