import { JSDOM } from "jsdom";
const getSize = (el: Element) => {
  const size = el.getAttribute("sizes");
  return (size && parseInt(size, 10)) || 0;
};

export const getIcon = (dom: JSDOM): string | null => {
  // find the biggest icon we can use
  const favicons = [
    ...dom.window.document.querySelectorAll(
      'link[rel="shortcut icon"],link[rel="icon"]'
    ),
  ].sort((a, b) => {
    return getSize(b) - getSize(a);
  });
  if (favicons.length > 0) {
    return favicons[0].getAttribute("href");
  }
  return null;
};
