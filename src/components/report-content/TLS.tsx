import { faUserGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import tomorrowNightBlue from "react-syntax-highlighter/dist/cjs/styles/hljs/tomorrow-night-blue";
import DescriptionAdditional from "../DescriptionAdditional";
import EffortEstimation, { EffortEstimationItem } from "../EffortEstimation";
import Result from "../Result";

import ReportContent from "./ReportContent";

const effortEstimation: Array<EffortEstimationItem> = [
  {
    title: "Gering (< 5 PT)",
    color: "green",
  },
  {
    title: "Ohne neue Hardware",
    color: "green",
  },
];
const TLS = () => {
  return (
    <ReportContent
      Result={
        <Result
          didPass={true}
          subtitle="Dieser Server unterstützt TLS in der Version 1.3. Dies ist die neueste Version des TLS-Protokolls und eine deutliche Verbesserung gegenüber früheren Protokollversionen"
        />
      }
      EffortEstimation={<EffortEstimation items={effortEstimation} />}
      TechnicalImplementation={
        <p className="mb-4">
          Nahezu alle marktüblichen Webkomponenten unterstützen die Verwendung
          des TLS-Protokolls in der Version 1.3 schon seit einigen Jahren. In
          der Regel kann TLSv1.3 durch eine einfache Konfigurationsanpassung an
          einem Loadbalancer, einer WAF, einem Reverse-Proxy oder einem
          Webserver aktiviert werden. Es sollte bei der Verwendung von Deep
          Paket Inspection auf die vorher notwendige TLS-Terminierung geachtete
          werden. Neben TLSv1.3 sollte zusätzlich derzeit noch TLS in der
          Version 1.2 zur Abwährskompatibilität verwendet werden.
        </p>
      }
      TechnicalImplementationAdditional={
        <div className="text-sm -m-3">
          <SyntaxHighlighter
            language="dsconfig"
            wrapLines
            wrapLongLines
            style={{ ...tomorrowNightBlue }}
          >
            {`# nginx.conf
server {
    [...]
    ssl_protocols TLSv1.2 TLSv1.3;
}`}
          </SyntaxHighlighter>
        </div>
      }
      Description={
        <p>
          IT-Sicherheit lebt von aktuellen Verschlüsselungsstandards wie
          TLSv1.3. Auch das BSI fordert diesen in seinem Mindeststandard. Trotz
          technischer Verfügbarkeit ist TLSv1.3 bisher nicht flächenddeckend
          aktiviert. Durch den Einsatz von diesem hochsicheren Ver-
          schlüsselungsverfahren wird der Gefahr des Abhörens und Verfälschens
          von Kommunikation durch Dritte bestmöglich begegnet. Die Verwendung
          von TLSv1.3 ist bei allen großen Internetangeboten übliche Praxis.
          Auch die Daten der Bürgerinnen und Bürger bei der Kommunikation zu
          ihrem OZG-Dienst sind entsprechend abzusichern. Eine Umsetzung ist i.
          d. R. durch einen Mitarbeiter des Rechenzentrumsbetriebs durchzuführen
          und erfordert nur einen geringen Aufwand.
        </p>
      }
      DescriptionAdditional={
        <DescriptionAdditional
          ReferenceTitle="BSI TLS 2.0.01a & c"
          ImplementationIcon={<FontAwesomeIcon icon={faUserGear} />}
          ImplementationTitle="RZ-Betrieb"
        />
      }
      ManagementSummary={
        <p>
          Beim Datenaustausch zwischen OZGDienst, Bürgerinnen und Bürgern muss
          ein Schutz gegen Mitlesen und Veränderung gewährleistet werden. Eine
          performante, moderne und hochsichere Verschlüsselung der Daten während
          der Übertragung erreicht diese Ziele und ist mit geringem Aufwand
          umsetzbar.
        </p>
      }
      subtitle="Sicherer Transport"
      title="Transport Layer Security (TLS) v1.3"
    />
  );
};

export default TLS;
