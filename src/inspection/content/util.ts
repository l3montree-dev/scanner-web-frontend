export const getSrcUrls = <T extends Element>(elements: T[]): string[] => {
  return elements
    .map((element) => element.getAttribute("src") || "")
    .filter((src) => src !== "");
};
