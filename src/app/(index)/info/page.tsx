import { redirect } from "next/navigation";
import { FunctionComponent } from "react";
import InfoContent from "../../../components/InfoContent";
import { withNotAvailable } from "../../../decorators/withNotAvailable";
import { Metadata } from "next";

const title =
  "Die OZG-Security-Challenge 2023: Gemeinsam zu mehr IT-Sicherheit";
const description =
  "Das Bundesministerium des Innern und für Heimat (BMI) möchte zur Stärkung der IT-Sicherheit bei der OZG-Umsetzung in Form einer Challenge beitragen. Bis zum 31. Oktober 2023 haben OZG-Dienstverantwortliche im Rahmen der „OZG-Security-Challenge 2023“ die Möglichkeit, die IT-Sicherheit der OZG-Onlinedienste mithilfe eines zugangsgeschützten Schnelltests sowie unterstützt durch Workshops und Sprechstunden weiter zu steigern.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  alternates: {
    canonical: "/info",
  },
};

interface Props {
  displayNotAvailable: boolean;
}
const page: FunctionComponent<Props> = ({ displayNotAvailable }) => {
  if (displayNotAvailable) {
    return redirect("/");
  }
  return <InfoContent displayNotAvailable={displayNotAvailable} />;
};

export default withNotAvailable(page);
