"use client";

import { FunctionComponent, useState } from "react";
import { withAuthProvider } from "../../providers/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/20/solid";

const BPAHeader: FunctionComponent = () => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <header className="z-50 sticky top-0 bg-zinc-900">
      {showBanner && (
        <div className="flex items-center gap-x-6 bg-ccb-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
          <p className="text-sm leading-6 text-white">
            Dieser Scanner basiert auf dem{" "}
            <a
              className="hover:text-ccb-100"
              href="https://bmi.usercontent.opencode.de/ozg-rahmenarchitektur/ozgsec/ozgsec-info/"
              target="_blank"
              rel="noopener noreferrer"
              id="banner-ozgsec-info"
              data-umami-event="Banner click - OZG Security Challenge Projekt"
            >
              OZG Security Challenge Projekt
            </a>{" "}
            des{" "}
            <a
              className="hover:text-ccb-100"
              href="https://www.bmi.bund.de/DE/startseite/startseite-node.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              BMI
            </a>{" "}
            &{" "}
            <a
              className="hover:text-ccb-100"
              href="https://www.bsi.bund.de/DE/Home/home_node.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              BSI
            </a>
          </p>
          <div className="flex flex-1 justify-end">
            <button
              onClick={() => setShowBanner(false)}
              type="button"
              className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div className="container">
        <div className="flex flex-row flex-wrap justify-between items-center">
          <div className="my-4">
            <Link
              id="ccb-link"
              data-umami-event="Go to ccb homepage"
              href="https://cyber-security-cluster.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                priority
                alt="Cyber Security Cluster Bonn e.V. Logo"
                width={220}
                height={100}
                src="/assets/ccb-logo.png"
              />
            </Link>
          </div>
          <div>
            <Image
              priority
              alt="L3montree Cybersecurity Logo"
              width={240}
              height={100}
              src="/assets/logo.svg"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default withAuthProvider(BPAHeader);
