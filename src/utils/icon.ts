import { JSDOM } from "jsdom";
import { HttpClient } from "../services/httpClient";
import { getLogger } from "../services/logger";

const logger = getLogger(__filename);

const getSize = (el: Element) => {
  const size = el.getAttribute("sizes");
  return (size && parseInt(size, 10)) || 0;
};

export const getIcon = async (
  requestId: string,
  fqdn: string,
  dom: JSDOM,
  httpClient: HttpClient
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
        const url = href.includes(fqdn) ? href : `https://${fqdn}${href}`;
        const res = await httpClient(url, requestId);
        if (res.status === 200) {
          const blob = await res.blob();

          const buffer = Buffer.from(await blob.arrayBuffer());
          return `data:${res.headers.get(
            "content-type"
          )};base64,${buffer.toString("base64")}`;
        } else {
          logger.warn(
            { requestId, status: res.status },
            `icon fetch failed for ${url}`
          );
        }
      } else {
        logger.warn({ requestId }, "no href found for icon");
      }
    } else {
      logger.debug({ requestId }, "no favicons found");
    }
    return null;
  } catch (e) {
    logger.error({ requestId, err: e }, "failed to get icon");
    return null;
  }
};
