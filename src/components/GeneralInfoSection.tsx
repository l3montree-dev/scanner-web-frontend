import {
  GlobeAltIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function GeneralInfoSection() {
  return (
    <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="e813992c-7d03-4cc4-a2bd-151760b470a0"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
          />
        </svg>
      </div>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="lg:max-w-lg">
              <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
                Über diese Schnelltest-Instanz
              </h2>
            </div>
          </div>
        </div>
        <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <Image
            className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
            src="/assets/opencode-ozgsec-screenshot.png"
            width={1500}
            height={720}
            alt="Screenshot der Repository-Gruppe des OZG Security Challenge Projekts auf der Open CoDE Plattform"
          />
          <div className="mt-10 flex">
            <a
              href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec"
              target="_blank"
              rel="noopener noreferrer"
              id="info-sec-opencode-button"
              data-umami-event="Open CoDE button info section clicked"
              className="bg-l3-400 px-3.5 py-2.5 rounded-sm text-sm sm:text-xs font-semibold text-black shadow-sm hover:bg-l3-300 hover:text-black hover:no-underline"
            >
              Zu OZGSec auf Open CoDE
            </a>
          </div>
        </div>
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="max-w-xl text-sm leading-7 lg:max-w-lg">
              <p>
                Das Bundesministerium des Innern und für Heimat hat auf der
                Plattform Open CoDE den Source Code des Projekts{" "}
                <a
                  href="https://bmi.usercontent.opencode.de/ozg-rahmenarchitektur/ozgsec/ozgsec-info/"
                  target="_blank"
                  className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                  rel="noopener noreferrer"
                >
                  „OZG-Security-Challenge 2023“
                </a>{" "}
                veröffentlicht. Dieses Projekt zielte darauf ab, die Umsetzung
                von IT-Sicherheitsmaßnahmen und Best Practices im Rahmen der
                Umsetzung des „Online-Zugangsgesetzes“ der öffentlichen
                Verwaltung zu steigern. Der Source Code wurde von dem
                Ministerium unter der European Public License (EUPL-1.2)
                veröffentlicht und steht, unter Einhaltung der
                Lizenzbedingungen, frei zur Verfügung.
              </p>
              <ul role="list" className="mt-8 space-y-8 ">
                <li className="flex gap-x-3">
                  <LockClosedIcon
                    className="mt-1 h-5 w-5 flex-none text-black"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold ">
                      Mehr IT-Sicherheit.
                    </strong>{" "}
                    Erhöhen Sie die Sicherheit Ihrer digitalen Dienste mit
                    bewährten Maßnahmen und Best Practices.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <GlobeAltIcon
                    className="mt-1 h-5 w-5 flex-none text-black"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold ">Open-Source.</strong>{" "}
                    Beteilligen Sie sich an der Weiterentwicklung.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ChatBubbleLeftRightIcon
                    className="mt-1 h-5 w-5 flex-none text-black"
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="font-semibold">
                      Austausch fördern.
                    </strong>{" "}
                    Teilen Sie Ihre Erfahrungen und Erkenntnisse mit anderen.
                  </span>
                </li>
              </ul>
              <p className="mt-8">
                Wir haben dieses Projekt nachgenutzt und eine Kopie des
                Web-Frontends mit einem angepassten Design erstellt (
                <a
                  href="https://github.com/l3montree-dev/scanner-web-frontend"
                  target="_blank"
                  className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                  rel="noopener noreferrer"
                  id="github-link-info"
                  data-umami-event="Open github page info section"
                >
                  Code auf GitHub
                </a>
                , EUPL-1.2 ). Mit dem ebenfalls im Rahmen des Projekts
                erstellten Helm-Charts haben wir das System in einem
                Kubernetes-Cluster installiert. Wir stellen die
                Schnelltest-Funktion mit dieser Instanz der Öffentlichkeit zur
                freien Nutzung zur Verfügung.
              </p>
              <p className="mt-8">
                Die folgenden Maßnahmen werden von dem System abgetestet:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/raw/main/public/one-pager/Responsible_Disclosure-One-Pager.pdf"
                    target="_blank"
                    className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                    rel="noopener noreferrer"
                  >
                    Responsible Disclosure
                  </a>
                </li>
                <li>
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/raw/main/public/one-pager/TLS1_3-One-Pager.pdf"
                    target="_blank"
                    className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                    rel="noopener noreferrer"
                  >
                    Transport Layer Security (TLS) 1.3
                  </a>
                </li>
                <li>
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/raw/main/public/one-pager/TLS1_1_off-One-Pager.pdf"
                    target="_blank"
                    className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                    rel="noopener noreferrer"
                  >
                    TLS 1.0 & 1.1 deaktivieren
                  </a>
                </li>
                <li>
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/raw/main/public/one-pager/HSTS-One-Pager.pdf"
                    target="_blank"
                    className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                    rel="noopener noreferrer"
                  >
                    HTTP Strict Transport Security (HSTS)
                  </a>
                </li>
                <li>
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/raw/main/public/one-pager/DNSSEC-One-Pager.pdf"
                    target="_blank"
                    className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                    rel="noopener noreferrer"
                  >
                    Domain Name System Security Extensions (DNSSEC)
                  </a>
                </li>
                <li>
                  <a
                    href="https://gitlab.opencode.de/bmi/ozg-rahmenarchitektur/ozgsec/ozgsec-web-frontend/-/raw/main/public/one-pager/RPKI-One-Pager.pdf"
                    target="_blank"
                    className="text-l3-600 font-normal underline decoration-dotted decoration-l3-600 underline-offset-4 hover:text-l3-500"
                    rel="noopener noreferrer"
                  >
                    Resource Public Key Infrastructure (RPKI)
                  </a>
                </li>
              </ul>
              <p className="mt-8">
                Das BMI hat zu jeder Maßnahme einen sogenannten One-Pager
                erstellt, welchen Sie bei den Prüfergebnissen abrufen können.
                Dieser erläutert jede Maßnahme auf einer Seite, aufgeteilt in
                eine „Management-Summary“, eine „Erläuterung für
                Onlinedienst-Verantwortliche“ und einen „Technischen
                Umsetzungsansatz“.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
