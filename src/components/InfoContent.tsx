import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next-router-mock";

const InfoContent = () => {
  const router = useRouter();
  const queryString = new URLSearchParams(router.query as any).toString();

  return (
    <article>
      <div className="max-w-screen-xl w-full md:pb-5 mx-auto">
        <div>
          <h1>
            Die OZG-Security-Challenge 2023: Gemeinsam zu mehr IT-Sicherheit
          </h1>
          <p>
            Das Bundesministerium des Innern und für Heimat (BMI) möchte die
            Steigerung der IT-Sicherheit in der öffentlichen Verwaltung weiter
            vorantreiben und in Form einer Challenge begegnen. Was es mit der
            OZG-Security-Challenge auf sich hat und wie Sie daran teilnehmen
            können, erfahren Sie hier.
          </p>
        </div>
        <div
          style={{ height: 392 }}
          className="flex flex-row justify-center overflow-hidden relative"
        >
          <div className="absolute -top-10 -bottom-10 -left-10 -right-10">
            <Image
              alt="OZG Security Schnelltest"
              fill
              className="object-cover blur-2xl"
              src={"/assets/OZG_Security-Challenge_Headerbild.png"}
            />
          </div>
          <Image
            alt="OZG Security Schnelltest"
            width={700}
            height={0}
            quality={100}
            className={"z-10 object-contain"}
            placeholder="empty"
            src={"/assets/OZG_Security-Challenge_Headerbild.png"}
          />
        </div>

        <div className="">
          <p>
            Mit der zunehmenden Digitalisierung der öffentlichen Verwaltung
            steigt die Bedeutung der zugrundeliegenden Informationssicherheit.
            Bürgerinnen, Bürger und Unternehmen erwarten, dass der Staat
            vertrauensvoll mit ihren persönlichen Daten umgeht und diese durch
            ein besonderes Maß an IT-Sicherheit schützt. Das Bundesministerium
            des Innern und für Heimat (BMI) möchte daher die Steigerung der
            IT-Sicherheit in der öffentlichen Verwaltung weiter vorantreiben und
            hat in Zusammenarbeit mit dem Bundesamt für Sicherheit in der
            Informationstechnik (BSI) die „OZG-Security-Challenge“ ins Leben
            gerufen.
          </p>

          <h2>Die Challenge im Überblick</h2>
          <div className="desc sm:float-right rounded-sm font-bold sm:mx-2 mb-2 text-right bg-hellgrau-20 p-5">
            <b>Sprechstunde:</b> Infos folgen demnächst
            <br />
            <b>Workshops:</b> Infos folgen demnächst
          </div>
          <p>
            Im Rahmen der OZG-Security-Challenge sollen
            OZG-Dienstverantwortliche des BMI über einen Zeitraum von sechs
            Monaten – bis zum 1. Oktober 2023 – mit leicht zugänglichen
            Angeboten in Form von Workshops und Sprechstunden bei der Umsetzung
            von sechs besonders relevanten IT-Sicherheitsmaßnahmen unterstützt
            und begleitet werden. Die Challenge gilt dann von den Personen als
            erfolgreich umgesetzt, wenn alle sechs IT-Sicherheitsmaßnahmen in
            den jeweiligen OZG-Onlinediensten implementiert wurden.
          </p>
          <p>
            Das Herzstück der Challenge bildet der Das Herzstück der Challenge
            bildet der{" "}
            <Link href={`/${queryString ? `?${queryString}` : ""}`}>
              OZG-Security-Challenge-Schnelltest
            </Link>
            . Der Schnelltest stellt den Umsetzungsgrad der sechs
            IT-Sicherheitsmaßnahmen auf den eingegebenen Webseiten dar, zeigt
            Potenziale zur weiteren Stärkung der IT-Sicherheit auf und gibt
            Hilfestellung bei deren Umsetzung. Zum jetzigen Zeitpunkt ist der
            Schnelltest exklusiv für OZG-Dienstverantwortliche zugänglich.
          </p>
          <p>
            Im Schnelltest wird die Umsetzung folgender sechs
            IT-Sicherheitsmaßnahmen überprüft:
          </p>
          <ul>
            <li>
              Responsible Disclosure: Responsible Disclosure ist ein Verfahren
              zur Sichtbarmachung und Meldung von erkannten Sicherheitslücken
              bzw. Schwachstellen in der Informationstechnik. bzw.
              Schwachstellen in der Informationstechnik.
            </li>
            <li>
              Transport Layer Security (TLS) 1.1 Durch die Deaktivierung von
              veralteten TLS bzw. SSL-Versionen wird sichergestellt, dass
              ausschließlich moderne Transportverschlüsselungsverfahren
              verwendet werden können.
            </li>
            <li>
              Transport Layer Security (TLS) 1.3: Die Transport Layer Security
              stellt ein Sicherheitsprotokoll zur Verschlüsselung von Daten für
              eine sichere Datenübertragung im Internet dar.
            </li>
            <li>
              HTTP Strict Transport Security (HSTS): HSTS lässt für einen
              angegebenen Zeitraum ausschließlich verschlüsselte und damit
              sichere Verbindungen zwischen Bürgerinnen, Bürger und Ihrem OZG
              Dienst zu.
            </li>
            <li>
              Resource Public Key Infrastructure (RPKI): Die Resource Public Key
              Infrastructure verhindert, dass Nutzerinnen und Nutzer auf falsche
              Server gelangen. Dies geschieht durch die Zuordnung von
              spezifischen Nummern (Internetnummernressourcen wie IP-Adressen)
              zu dem dazugehörigen Ressourceninhaber.
            </li>
            <li>
              Domain Name System Security Extensions (DNSSEC): Das Domaine Name
              System (DNS) stellt eine Art Telefonauskunft oder Übersetzer dar,
              indem Homepage-Namen (z.B. domain.de) in IP-Adressen (z.B.
              183.0.3.12) übersetzt werden.
            </li>
          </ul>
          <p>
            Die Ergebnisse des Schnelltests werden den Teilnehmenden in
            Sekundenschnelle bereitgestellt und mit Informationen und
            Erklärungen zur Umsetzung der IT-Sicherheitsmaßnahmen ergänzt.
            Darüber hinaus bietet das BMI über die gesamte Laufzeit der
            Challenge eine Sprechstunde für OZG-Dienstverantwortliche an. Für
            die Umsetzung der beiden IT-Sicherheitsmaßnahmen RPKI und DNSSEC
            werden zudem Workshops angeboten, in welchen die
            OZG-Dienstverantwortlichen praxisnah bei der Umsetzung unterstützt
            werden.
          </p>
          <p>
            Es bedarf keiner offiziellen Registrierung zur Challenge, bei
            Interesse können sich die Teilnehmenden jedoch auf der Seite des
            Schnelltests für die OZG-Security-Challenge anmelden, um exklusive
            Hintergrundinformationen zur Challenge sowie Updates zu
            Sprechstunden und Workshops zu erhalten. Die Teilnehmenden können
            ihre Teilnahme an der Challenge zudem durch den Sticker der
            OZG-Security-Challenge demonstrieren: Der weiße Sticker verdeutlicht
            die Teilnahme an der Challenge, bei erfolgreicher Implementierung
            und Abschluss der Challenge erhalten die Teilnehmenden zudem den
            goldenen Sticker der OZG-Security-Challenge.
          </p>
          <h2>Die IT-Sicherheitsmaßnahmen im Detail</h2>
          <p>
            Im Zuge der OZG-Security-Challenge werden die Umsetzungsstände von
            sechs spezifischen IT-Sicherheitsmaßnahmen dargestellt. Diese wurden
            ausgewählt, da sie den gültigen IT-Sicherheitsstandards der
            öffentlichen Verwaltung entsprechen und einen wichtigen Beitrag zur
            sicheren OZG-Umsetzung leisten. Mit der Erfüllung der sechs
            IT-Sicherheitskriterien kann das Sicherheitspotenzial der Portale
            und Webseiten der öffentlichen Verwaltung noch weiter gesteigert
            werden.
          </p>
          <p>
            Diese sechs IT-Sicherheitsmaßnahmen sind nicht abschließend zu
            betrachten, sondern stellen einen ersten Ansatz zur Prüfung der
            IT-Sicherheit im OZG-Kontext dar. Die Umsetzung von IT-Sicherheit
            ist ein Prozess, der kontinuierlich erweitert wird. So ist auch
            geplant, den Schnelltest weiter auszubauen und sukzessive, um
            weitere Kriterien zu erweitern. Der Schnelltest wird daher auch nach
            der Challenge weiterhin zur Verfügung stehen.
          </p>
          <h2>
            Hintergrund: Die Bedeutung der IT-Sicherheit in der öffentlichen
            Verwaltung steigt
          </h2>
          <p>
            Die Relevanz der Informationssicherheit wird durch den Bund im{" "}
            <Link
              rel="noopener noreferrer"
              target={"_blank"}
              href={
                "https://www.bundesregierung.de/breg-de/service/gesetzesvorhaben/koalitionsvertrag-2021-1990800"
              }
              prefetch={false}
            >
              Koalitionsvertrag
            </Link>{" "}
            sowie in der{" "}
            <Link
              href="https://www.bundesregierung.de/breg-de/themen/digitaler-aufbruch/digitalstrategie-2072884"
              rel="noopener noreferrer"
              target={"_blank"}
              prefetch={false}
            >
              Digitalstrategie der Bundesregierung
            </Link>{" "}
            betont. Entsprechend verpflichtet sich der Staat im Kapitel Digitale
            Innovation und Infrastruktur des Koalitionsvertrags, die Möglichkeit
            echter verschlüsselter Kommunikation anzubieten. Zudem werden alle
            staatlichen Stellen verpflichtet, ihnen bekannte Sicherheitslücken
            beim BSI zu melden und sich regelmäßig einer externen Überprüfung
            ihrer IT-Systeme zu unterziehen.
          </p>
          <p>
            Aufgrund der Schnelllebigkeit und Komplexität des Themas wird die
            IT-Sicherheit der öffentlichen Verwaltung fortlaufend an externe
            Gegebenheiten angepasst, beispielsweise durch die Aufnahme von
            „Responsible Disclosure“ in die „Einer für Alle“
            (EfA)-Mindestanforderungen 2.0 (Stand November 2022). Eine
            flächendeckende Anwendung der neuesten IT-Sicherheitsmaßnahmen ist
            derzeit noch nicht gegeben, diese soll daher durch die Challenge
            weiter gesteigert werden.
          </p>
          <p>
            Schon zu Beginn der Umsetzung des Onlinezugangsgesetzes (OZG) war
            klar, dass die Verwaltungsdigitalisierung nur erfolgreich sein kann,
            wenn sie eine wirkliche Verbesserung für Alle mit sich bringt und
            die konzipierten Onlinedienste auch akzeptiert und genutzt werden.
            Daher gilt es, das Vertrauen der Bürgerinnen, Bürger und Unternehmen
            in die Onlinedienste zu stärken.
          </p>
          <p>
            Die OZG-Security-Challenge setzt hier an und regt zur Steigerung der
            Bekanntheit der IT-Sicherheitsmaßnahmen an und unterstützt die
            OZG-Dienstverantwortlichen durch ein umfassendes Sprechstunden- und
            Kommunikationsangebot bei deren Umsetzung.
          </p>
        </div>
      </div>
    </article>
  );
};

export default InfoContent;
