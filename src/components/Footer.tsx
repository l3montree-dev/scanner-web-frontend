import { FunctionComponent } from "react";
import ScrollUpButton from "./ScrollUpButton";
import Link from "next/link";

const Footer: FunctionComponent = () => {
  let imprintUrl: string = process.env.NEXT_PUBLIC_IMPRINT_URL || "/impressum";

  return (
    <footer className="bg-zinc-900 relative pb-10">
      <div className="flex flex-row justify-center pt-10">
        <ScrollUpButton />
      </div>
      <div className="container pt-10 text-xs">
        <div className="lg:flex text-white pt-10 border-t justify-between">
          <div className="flex flex-wrap gap-2  flex-row">
            <Link
              aria-label="Impressum öffnen"
              href={"https://cyber-security-cluster.eu/impressum/"}
              className="cursor-pointer text-white uppercase font-medium p-2 hover:text-white"
              type="button"
              target="_blank"
              rel="noopener noreferrer"
              id="imprint-link"
              data-umami-event="Open imprint page"
            >
              Impressum
            </Link>

            <Link
              aria-label="Datenschutzerklärung öffnen"
              href="https://cyber-security-cluster.eu/datenschutz/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer uppercase font-medium text-white p-2 hover:text-white"
              type="button"
              id="privacy-link"
              data-umami-event="Open privacy page"
            >
              Datenschutz
            </Link>
          </div>
          <div className="flex flex-wrap flex-row mb-0">
            <span className="mt-5 py-2 sm:mt-0">
              <a
                href="https://github.com/l3montree-dev/scanner-web-frontend/tree/ccb"
                rel="noopener noreferrer"
                className="p-2 uppercase font-medium text-white block hover:text-white"
                target={"_blank"}
                id="github-link"
                data-umami-event="Open github page - footer"
              >
                Code dieser Anwendung auf GitHub ↗
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
