import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { tailwindColors } from "../utils/view";

export interface Props {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
}
const Meta: FunctionComponent<Props> = ({
  title,
  description,
  keywords,
  canonicalUrl,
}) => {
  const router = useRouter();
  return (
    <Head>
      <title>{title ?? "OZG-Security-Challenge 2023"}</title>
      <meta
        name="description"
        content={
          description ??
          "OZG Security Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices"
        }
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        rel="canonical"
        data-testid="canonical"
        href={(canonicalUrl ?? "https://ozgsec.de") + router.pathname}
      />
      <meta
        name="title"
        content={title ?? "OZG Security Schnelltest einer Webseite"}
      />
      <meta
        name="keywords"
        content={
          keywords ??
          "OZG, Security, IT-Security, Schnelltest, IT-Sicherheit, Onlinezugangsgesetz, Security-Challenge, OZG Security-Challenge 2023, Best-Practices, Website Scan"
        }
      />
      <meta name="theme-color" content={tailwindColors.deepblue["900"]} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ozgsec.de/" />
      <meta
        property="og:title"
        content={title ?? "OZG-Security-Challenge 2023"}
      />
      <meta
        property="og:description"
        content={
          description ??
          "OZG Security Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices"
        }
      />

      <meta property="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:url"
        content={(canonicalUrl ?? "https://ozgsec.de") + router.pathname}
      />
      <meta
        property="twitter:title"
        content={title ?? "OZG-Security-Challenge 2023"}
      />
      <meta
        property="twitter:description"
        content={
          description ??
          "OZG Security Schnelltest einer Webseite in Bezug auf IT-Sicherheitsmaßnahmen und Best-Practices"
        }
      />
    </Head>
  );
};

export default Meta;
