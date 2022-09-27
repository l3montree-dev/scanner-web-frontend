import { ContentInspectionType, InspectionResult } from "../Inspector";
import { JSDOM } from "jsdom";
import { getSrcUrls } from "./util";

export const noMixedContentChecker = (dom: JSDOM): InspectionResult => {
  // get all script, link, image and iframe elements.
  const resourceElements = [
    ...Array.from<Element>(dom.window.document.querySelectorAll("link")),
    ...Array.from(dom.window.document.querySelectorAll("script")),
    ...Array.from(dom.window.document.querySelectorAll("img")),
    ...Array.from(dom.window.document.querySelectorAll("video")),
    ...Array.from(dom.window.document.querySelectorAll("iframe")),
  ];

  // check , if there are any elements which source attribute starts with http://
  const elementsWithHttpSource = resourceElements.filter((element) => {
    const source = element.getAttribute("src");
    return source && source.startsWith("http://");
  });

  // if there are elements with invalid integrity prefix, return false.
  if (elementsWithHttpSource.length > 0) {
    return new InspectionResult(ContentInspectionType.NoMixedContent, false, {
      elementsWithHttpSource: getSrcUrls(elementsWithHttpSource),
    });
  }

  // if all elements have integrity and a valid integrity prefix, return true.
  return new InspectionResult(ContentInspectionType.NoMixedContent, true, {});
};
