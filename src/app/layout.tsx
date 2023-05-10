import "../styles/globals.scss";

import Toaster from "../components/Toaster";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
import Footer from "../components/Footer";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="text-base">
        {children}
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
