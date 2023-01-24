import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FunctionComponent, useState } from "react";
import Imprint from "./Imprint";
import Modal from "./Modal";

interface Props {
  hideLogin?: boolean;
}
const Footer: FunctionComponent<Props> = ({ hideLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();

  return (
    <>
      <footer className="bg-white md:text-md text-sm px-2 md:px-10 pb-10">
        <div className="sm:flex flex-wrap justify-between flex-row p-0 pt-5 sm:pb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flex px-1 flex-row">
            <img
              width={370}
              height={100}
              src={"/assets/BMI_de_v3__BSI_de_v1__Web_farbig.svg"}
              alt="Logo BMI & BSI"
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={120}
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
            {!Boolean(hideLogin) && (
              <div className="mr-2 mb-8 sm:mb-0">
                {session.status === "authenticated" ? (
                  <>
                    <Link className="mr-2" href="/dashboard">
                      Dashboard
                    </Link>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={async () => {
                        const res: { path: string } = await (
                          await fetch("/api/auth/kc-signout")
                        ).json();
                        await signOut({
                          redirect: false,
                        });
                        window.location.href = res.path;
                      }}
                    >
                      Logout
                    </span>
                  </>
                ) : (
                  <Link href="/dashboard">Login</Link>
                )}
              </div>
            )}
            <span className="mt-5 sm:mt-0">
              © Bundesministerium des Innern und für Heimat,{" "}
              {new Date().getFullYear()}
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
