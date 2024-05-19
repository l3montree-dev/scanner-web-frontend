import { FunctionComponent } from "react";
import IndexContent from "../../components/IndexContent";
import { withNotAvailable } from "../../decorators/withNotAvailable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Challenge Schnelltest | L3montree",
  description:
    "Security Challenge Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices",
  openGraph: {
    title: "Security Challenge Schnelltest",
    description:
      "Security Challenge Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

const Index: FunctionComponent<{ displayNotAvailable: boolean }> = ({
  displayNotAvailable,
}) => {
  return <IndexContent displayNotAvailable={displayNotAvailable} />;
};

export default withNotAvailable(Index);
