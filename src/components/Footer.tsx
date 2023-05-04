import { useSession } from "next-auth/react";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";
import Imprint from "./Imprint";
import Privacy from "./Privacy";
import Modal from "./Modal";
import { useRouter } from "next/router";
import { useSignOut } from "../hooks/useSignOut";
import Image from "next/image";

const Footer: FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyIsOpen] = useState(false);
  const session = useSession();
  const router = useRouter();

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
      <footer className="bg-bund relative px-2 md:px-10 pb-10">
        <div className="container flex-wrap flex justify-end flex-row pt-10 pb-5">
          <Image
            width={140}
            height={61}
            src={"/assets/ozg-logo.svg"}
            alt="OZG Logo"
          />
        </div>
        <div className="container text-sm">
          <div className="lg:flex text-white border-t justify-between">
            <div className="flex flex-wrap flex-row mb-0">
              <span className="mt-5 py-2 sm:mt-0">
                © Bundesministerium des Innern und für Heimat,{" "}
                {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex gap-2 flex-row">
              <span>
                <button
                  aria-label="Impressum öffnen"
                  onClick={() => setIsOpen(true)}
                  className="cursor-pointer uppercase font-medium hover:underline p-2"
                  type="button"
                >
                  Impressum
                </button>
              </span>
              <span>
                <button
                  aria-label="Datenschutzerklärung öffnen"
                  onClick={() => setPrivacyIsOpen(true)}
                  className="cursor-pointer uppercase font-medium hover:underline p-2"
                  type="button"
                >
                  Datenschutz
                </button>
              </span>
              <span>
                <a
                  href="https://www.onlinezugangsgesetz.de/"
                  rel="noopener noreferrer"
                  className="p-2 uppercase font-medium block"
                  target={"_blank"}
                >
                  Onlinezugangsgesetz.de
                </a>
              </span>
            </div>
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
