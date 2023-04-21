import { useSession } from "next-auth/react";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";
import Imprint from "./Imprint";
import Privacy from "./Privacy";
import Modal from "./Modal";
import { useRouter } from "next/router";
import { useSignOut } from "../hooks/useSignOut";
import Image from "next/image";

interface Props {
  hideLogin?: boolean;
}
const Footer: FunctionComponent<Props> = ({ hideLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyIsOpen] = useState(false);
  const session = useSession();
  const router = useRouter();
  const signOut = useSignOut();

  useEffect(() => {
    if (router.query["action"] === "openImprintModal") {
      setIsOpen(true);
    }
    if (router.query["action"] === "openPrivacyModal") {
      setPrivacyIsOpen(true);
    }
  }, []);

  return (
    <>
      <footer className="bg-white text-black relative md:text-md text-sm px-2 md:px-10 pb-10">
        <div className="sm:flex flex-wrap justify-between flex-row p-0 pt-5 sm:pb-5">
          <div className="flex px-1 flex-row">
            <Image
              width={370}
              height={100}
              priority
              src={"/assets/BMI_de_v3__BSI_de_v1__Web_farbig.svg"}
              alt="Logo BMI & BSI"
            />
          </div>
          <Image
            width={140}
            height={61}
            className="sm:ml-5 mb-10 sm:mb-0 ml-0 mt-5 sm:mt-0"
            src={"/assets/ozg-logo-colored.svg"}
            alt="OZG Logo"
          />
        </div>
        <div className="lg:flex justify-between">
          <div className="flex flex-wrap flex-row mb-0">
            <span className="mr-4">
              <button
                aria-label="Impressum öffnen"
                onClick={() => setIsOpen(true)}
                className="cursor-pointer hover:underline p-2"
                type="button"
              >
                Impressum
              </button>
            </span>
            <span className="mr-4">
              <button
                aria-label="Datenschutzerklärung öffnen"
                onClick={() => setPrivacyIsOpen(true)}
                className="cursor-pointer hover:underline p-2"
                type="button"
              >
                Datenschutz
              </button>
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
          <div className="flex-row flex-wrap sm:flex">
            {!Boolean(hideLogin) && (
              <div className="mr-2 mb-8 sm:mb-0">
                {session.status === "authenticated" ? (
                  <div className="flex flex-row">
                    <Link className="mr-2 p-2 block" href="/dashboard">
                      Dashboard
                    </Link>
                    <span
                      className="cursor-pointer p-2 block hover:underline"
                      onClick={() => {
                        return signOut();
                      }}
                    >
                      Logout
                    </span>
                  </div>
                ) : (
                  <Link className="p-2 block" href="/dashboard">
                    Login
                  </Link>
                )}
              </div>
            )}
            <span className="mt-5 p-2 sm:mt-0">
              © Bundesministerium des Innern und für Heimat,{" "}
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
      <Modal title="Impressum" onClose={() => setIsOpen(false)} isOpen={isOpen}>
        <Imprint />
      </Modal>
      <Modal
        title="Datenschutzerklaerung"
        onClose={() => setPrivacyIsOpen(false)}
        isOpen={isPrivacyOpen}
      >
        <Privacy />
      </Modal>
    </>
  );
};

export default Footer;
