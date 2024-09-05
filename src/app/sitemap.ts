import { MetadataRoute } from "next";
import { config } from "../config";

const baseUrl = config.canonicalUrl;

// will be statically optimized at build time
// therefore we can use the date - which will be the build date
export default function sitemap(): MetadataRoute.Sitemap {
  let imprintUrl: string = process.env.NEXT_PUBLIC_IMPRINT_URL || "/impressum";

  return [
    ...["/", imprintUrl, "/datenschutz", "/info"].map((entry) => ({
      url: `${baseUrl}${entry}`,
      lastModified: new Date(),
    })),
  ];
}
