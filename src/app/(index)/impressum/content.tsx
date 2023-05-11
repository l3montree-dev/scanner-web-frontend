"use client";
import React, { FunctionComponent, useEffect } from "react";
import Article from "../../../components/common/Article";
import { useGlobalStore } from "../../../zustand/global";

interface Props {
  displayNotAvailable: boolean;
}
const Content: FunctionComponent<Props> = ({ displayNotAvailable }) => {
  const store = useGlobalStore();
  useEffect(() => {
    store.setHideLogin(displayNotAvailable);
  }, [displayNotAvailable]);
  return (
    <Article title="Impressum" teaser="">
      <p>
        <br />
        <br />
        <strong>Das Internetangebot wird herausgegeben vom</strong>
        <br />
        Bundesministerium des Innern und für Heimat
        <br />
        Referat DV II 2
        <br />
        Alt-Moabit 140
        <br />
        10557 Berlin
        <br />
        Telefon: +49-(0)30 18 681-0
        <br />
        E-Mail: <a href="mailto:ozgsec@bmi.bund.de">ozgsec@bmi.bund.de</a>
        <br />
        <br />
        weitere{" "}
        <a
          href="https://www.bmi.bund.de/DE/service/kontakt/kontakt_node.html"
          rel="noopener noreferrer"
          target="_blank"
        >
          Kontaktmöglichkeiten
        </a>
        <br />
        <br />
        <strong>Redaktionell verantwortlich:</strong>
        <br />
        Ralf Käck
        <br />
        <br />
        <strong>Presserechtlich verantwortlich:</strong>
        <br />
        Ernst Bürger
        <br />
        <br />
        <strong>Realisierung:</strong>
        <br />
        Neuland@Homeland GmbH
        <br />
        <br />
        <strong>Design:</strong>
        <br />
        Neuland@Homeland GmbH
        <br />
        <br />
        <strong>Hosting:</strong>
        <br />
        Neuland@Homeland GmbH
        <br />
        <br />
        <h2>Rechtliche Hinweise</h2>
        <br />
        Die Inhalte der Internet-Seiten von www.bmi.bund.de (hier ozgsec.de)
        sollen den Zugang der Öffentlichkeit zu Informationen unseres
        Ministeriums erleichtern und ein zutreffendes Bild von den Tätigkeiten,
        Planungen und Vorhaben des Bundesministeriums des Innern und für Heimat
        vermitteln. Auf die Richtigkeit, Aktualität, Vollständigkeit,
        Verständlichkeit und jederzeitige Verfügbarkeit der bereitgestellten
        Informationen wird sorgfältig geachtet.
        <br />
        <br />
        Dennoch sind folgende Einschränkungen zu machen:
        <br />
        <br />
        1. Inhalte anderweitiger Anbieter
        <br />
        <br />
        Die auf diesen Seiten vorhandenen Links zu Inhalten von Internet-Seiten
        Dritter (&quot;fremden Inhalten&quot;) wurden durch das
        Bundesministerium des Innern und für Heimat (Redaktion) nach bestem
        Wissen und unter Beachtung größtmöglicher Sorgfalt erstellt und
        vermitteln lediglich den Zugang zu &quot;fremden Inhalten&quot;. Dabei
        wurde auf die Vertrauenswürdigkeit dritter Anbieter und die
        Fehlerfreiheit sowie Rechtmäßigkeit der &quot;fremden Inhalte&quot;
        besonders geachtet.
        <br />
        Da jedoch der Inhalt von Internetseiten dynamisch ist und sich jederzeit
        ändern kann, ist eine stetige Einzelfallprüfung sämtlicher Inhalte, auf
        die ein Link erstellt wurde, nicht in jedem Fall möglich. Das
        Bundesinnenministerium macht sich deshalb den Inhalt von Internet-Seiten
        Dritter, die mit der eigenen Internetpräsenz verlinkt sind, insoweit
        ausdrücklich nicht zu eigen. Für
        <br />
        Schäden aus der Nutzung oder Nichtnutzung &quot;fremder Inhalte&quot;
        haftet ausschließlich der jeweilige Anbieter der Seite, auf die
        verwiesen wurde.
        <br />
        <br />
        2. Eigene Inhalte
        <br />
        <br />
        Soweit die auf diesen Seiten eingestellten Inhalte Rechtsvorschriften,
        amtliche Hinweise, Empfehlungen oder Auskünfte enthalten, sind sie nach
        bestem Wissen und unter Beachtung größtmöglicher Sorgfalt erstellt. Bei
        Unstimmigkeiten gilt jedoch ausschließlich die aktuelle amtliche
        Fassung, wie sie im dafür vorgesehenen amtlichen Verkündungsorgan
        veröffentlicht ist. Etwaige rechtliche Hinweise, Empfehlungen und
        Auskünfte sind unverbindlich; eine Rechtsberatung findet nicht statt.
        <br />
        Für das bereitgestellte Informationsangebot gilt folgende
        Haftungsbeschränkung: Das Bundesinnenministerium haftet nicht für
        Schäden, die durch die Nutzung oder Nichtnutzung angebotener
        Informationen entstehen. Für etwaige Schäden, die beim Aufrufen oder
        Herunterladen von Daten durch Computerviren oder der Installation oder
        Nutzung von Software verursacht werden, wird nicht gehaftet.
        <br />
        <br />
        3. Fehlermeldungen
        <br />
        <br />
        Sollten auf dieser Internetpräsenz Links enthalten sein, die auf
        rechtswidrige oder fehlerhafte Inhalte Dritter verweisen, so bittet die
        Redaktion die Nutzer von www.bmi.bund.de (hier ozgsec.de) darum, hierauf
        ggf. aufmerksam zu machen. Ebenso wird um eine Nachricht über das{" "}
        <a
          href="https://www.bmi.bund.de/DE/service/kontakt/internetredaktion/internetredaktion-kontakt-node.html"
          rel="noopener noreferrer"
          target="_blank"
        >
          Kontaktformular
        </a>{" "}
        gebeten, wenn eigene Inhalte nicht fehlerfrei, aktuell, vollständig und
        verständlich sind.
        <br />
        <br />
        4. Datenschutz
        <br />
        <br />
        Erfahren Sie mehr hierzu in der{" "}
        <a
          href="https://www.bmi.bund.de/DE/service/datenschutz/datenschutz_node.html"
          rel="noopener noreferrer"
          target="_blank"
        >
          Datenschutzerklärung
        </a>
        .<br />
        <br />
        5. Urheberrecht
        <br />
        <br />
        Das Copyright für Texte liegt, soweit nicht anders vermerkt, bei der
        Bundesrepublik Deutschland, vertreten durch das Bundesministerium des
        Innern und für Heimat.
        <br />
        Das Copyright für Bilder liegt, soweit nicht anders vermerkt, bei der
        Bundesrepublik Deutschland, vertreten durch das Bundesministerium des
        Innern und für Heimat oder durch die Bundesbildstelle des Presse- und
        Informationsamtes der Bundesregierung.
        <br />
        Auf den BMI-Webseiten zur Verfügung gestellte Texte, Textteile,
        Grafiken, Tabellen oder Bildmaterialien dürfen ohne vorherige Zustimmung
        des BMI nicht vervielfältigt, nicht verbreitet und nicht ausgestellt
        werden.
        <br />
        <br />
        6. Nutzungsbedingungen für Bilder
      </p>
      <ol>
        <li>
          Das Bundesministerium des Innern und für Heimat (nachfolgend BMI) hat
          für die Bundesrepublik Deutschland alle Nutzungsrechte von den
          Urhebern der digitalen Bilder erworben, soweit nichts Gegenteiliges,
          z.B. in den begleitenden Bildinformationen, angegeben ist.
        </li>
        <li>
          Die Bildinformationen und die darin enthaltenen Nutzungs- und
          Verwendungsbeschränkungen sind zu beachten. Für die aus der
          Nichtbeachtung resultierenden Schäden haftet der Nutzer. Er hat das
          BMI insoweit von Ansprüchen Dritter freizustellen.
        </li>
        <li>
          Mit dem Quellennachweis &quot;BMI&quot; ausgezeichnete Bilder können
          grundsätzlich kostenfrei heruntergeladen und im Rahmen der
          Berichterstattung für folgende Zwecke genutzt werden:
          <ul>
            <li>Presseveröffentlichungen</li>
            <li>Veröffentlichungen in Printmedien</li>
            <li>Veröffentlichungen durch Film und Fernsehen</li>
            <li>Online- und multimediale Veröffentlichungen</li>
          </ul>
          Eine darüber hinausgehende Nutzung für kommerzielle Zwecke,
          insbesondere für Werbezwecke, ist nicht zulässig. Bilder mit einem
          anderen Quellennachweis als &quot;BMI&quot; sind für eine Nutzung
          durch Dritte nicht freigegeben.
        </li>
        <li>
          Jegliche Bearbeitung, Umgestaltung oder Manipulation der digitalen
          Bilder, die über Farbkorrekturen, Ausschnitte und Verkleinerungen
          hinausgehen, ist unzulässig und nur mit vorheriger schriftlicher
          Zustimmung seitens des BMI erlaubt. Ebenso darf das digitale Bild
          nicht in einem sinnentstellten Zusammenhang wiedergegeben werden.
        </li>
        <li>
          Eine Entstellung des urheberrechtlichen geschützten Werks in Bild,
          Wort bzw. jeglicher anderen Form, z.B. durch Nachfotografieren,
          zeichnerische Verfälschung, Fotocomposing oder elektronische
          Hilfsmittel ist nicht zulässig. Der Nutzer trägt die Verantwortung für
          die Betextung.
        </li>
        <li>
          Die Presse ist insbesondere zur Beachtung der publizistischen
          Grundsätze des Deutschen Presserates (Pressekodex) verpflichtet. Die
          Zustimmung zur Nutzung des Bildmaterials umfasst nicht die
          Zusicherung, dass die abgebildeten Personen, die Inhaber der Rechte an
          abgebildeten Werken oder die Inhaber von Marken- und sonstigen
          Schutzrechten die Einwilligung zu einer öffentlichen Wiedergabe
          erteilt haben. Die Einholung der im Einzelfall notwendigen
          Einwilligunge Dritter obliegt dem Nutzer. Er hat die Persönlichkeits-,
          Urheber-, Marken- und sonstigen Schutzrechte von abgebildeten
          Personen, Werken, Gegenständen oder Zeichen selbst zu beachten. Bei
          Missachtung solcher Rechte ist allein der Nutzer etwaigen Dritten
          gegenüber schadenersatzpflichtig.
        </li>
        <li>
          Das BMI behält sich vor, dem Verdacht einer missbräuchlichen Nutzung
          oder einer wesentlichen Nutzungsverletzung nachzugehen.
        </li>
        <li>
          Bei Verwendung des digitalen Bildes ist die Quelle
          &quot;Bundesministerium des Innern und für Heimat&quot; anzugeben.
          Dies gilt auch für elektronische Publikationen (z.B. Webseiten). Von
          jeder Veröffentlichung im Druck ist dem BMI ein Belegexemplar
          unaufgefordert und kostenfrei zuzusenden:
        </li>
      </ol>
      <p>
        <br />
        <br />
        Bundesministerium des Innern und für Heimat, Alt-Moabit 140, 10557
        Berlin
      </p>
    </Article>
  );
};

export default Content;
