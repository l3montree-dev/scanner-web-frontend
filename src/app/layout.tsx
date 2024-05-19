import "../styles/globals.scss";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { Metadata } from "next";
import Footer from "../components/Footer";
import Toaster from "../components/Toaster";
import { config as customConfig } from "../config";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export const metadata: Metadata = {
  metadataBase: customConfig.canonicalUrl
    ? new URL(customConfig.canonicalUrl)
    : null,
};
export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <script
          async
          src="https://umami.l3montree.com/script.js"
          data-website-id="38b37448-06d8-4d44-9715-a929271df4ba"
        ></script>
      </head>
      <body className="text-base">
        {children}
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
