import { JSDOM } from "jsdom";
import { getLogger } from "../services/logger";

const logger = getLogger(__filename);

const getSize = (el: Element) => {
  const size = el.getAttribute("sizes");
  return (size && parseInt(size, 10)) || 0;
};

export const getIcon = async (
  fqdn: string,
  dom: JSDOM,
  httpClient: typeof fetch
): Promise<string | null> => {
  try {
    // find the biggest icon we can use
    const favicons = [
      ...dom.window.document.querySelectorAll(
        'link[rel="shortcut icon"],link[rel="icon"],link[rel="apple-touch-icon"]'
      ),
    ].sort((a, b) => {
      return getSize(b) - getSize(a);
    });

    if (favicons.length > 0) {
      const href = favicons[0].getAttribute("href");
      // fetch the icon.
      if (href) {
        const res = await httpClient(
          href.includes(fqdn) ? href : `https://${fqdn}${href}`
        );
        if (res.status === 200) {
          const blob = await res.blob();

          const buffer = Buffer.from(await blob.arrayBuffer());
          return `data:${res.headers.get(
            "content-type"
          )};base64,${buffer.toString("base64")}`;
        }
      } else {
        logger.warn("no href found for icon");
      }
    } else {
      logger.debug("no favicons found");
    }
    return null;
  } catch (e) {
    logger.error(e, "failed to get icon");
    return null;
  }
};
