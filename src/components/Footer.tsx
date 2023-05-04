import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

const Footer: FunctionComponent = () => {
  const router = useRouter();

  return (
    <footer className="bg-bund relative pb-10">
      <div className="flex flex-row justify-center pt-10">
        <div
          role="button"
          onClick={() => {
            // scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="border-2 border-white hover:bg-white p-3 flex transition-all flex-row items-center justify-center text-white hover:text-bund rounded-full cursor-pointer"
        >
          <svg
            className="w-5 h-5 -rotate-90 relative fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 8 12"
          >
            <path
              d="M7.1 5.8 1.5.2a.2.2 0 0 0-.3 0l-1 1a.2.2 0 0 0 0 .4L4.4 6 0 10.4a.2.2 0 0 0 0 .3l1 1a.2.2 0 0 0 .4 0l5.6-5.5a.3.3 0 0 0 0-.4Z"
              data-name="slide-right"
            />
          </svg>
        </div>
      </div>
      <div className="container flex-wrap flex justify-end flex-row pt-10 pb-5">
        <Image
          width={140}
          height={61}
          src={"/assets/ozg-logo.svg"}
          alt="OZG Logo"
        />
      </div>
      <div className="container pt-10 text-xs">
        <div className="lg:flex text-white pt-10 border-t justify-between">
          <div className="flex flex-wrap gap-2  flex-row">
            <span>
              <Link
                aria-label="Impressum öffnen"
                href={"/impressum"}
                className="cursor-pointer text-white uppercase font-medium hover:border-white p-2 hover:text-white"
                type="button"
              >
                Impressum
              </Link>
            </span>
            <span>
              <Link
                aria-label="Datenschutzerklärung öffnen"
                href="/datenschutz"
                className="cursor-pointer uppercase font-medium hover:border-b hover:border-b-white text-white p-2 hover:text-white"
                type="button"
              >
                Datenschutz
              </Link>
            </span>
            <span>
              <a
                href="https://www.onlinezugangsgesetz.de/"
                rel="noopener noreferrer"
                className="p-2 uppercase font-medium hover:border-b-white text-white block hover:text-white"
                target={"_blank"}
              >
                Onlinezugangsgesetz.de
              </a>
            </span>
          </div>
          <div className="flex flex-wrap flex-row mb-0">
            <span className="mt-5 py-2 sm:mt-0">
              © Bundesministerium des Innern und für Heimat,{" "}
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
