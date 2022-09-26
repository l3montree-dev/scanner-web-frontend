import { ContentInspectionType, InspectionResult } from "../Inspector";
import { JSDOM } from "jsdom";
import { getSrcUrls } from "./util";

const hasValidIntegrityPrefix = (integrityString: string) => {
  return (
    // ref: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#using_subresource_integrity
    integrityString.startsWith("sha256-") ||
    integrityString.startsWith("sha384-") ||
    integrityString.startsWith("sha512-")
  );
};

const withoutIntegrityAttribute = <T extends Element>(elements: T[]): T[] => {
  return elements.filter((element) => !element.hasAttribute("integrity"));
};

const withoutValidIntegrityAttribute = <T extends Element>(
  elements: T[]
): T[] => {
  return elements.filter((element) => {
    const integrityString = element.getAttribute("integrity");
    return integrityString && hasValidIntegrityPrefix(integrityString);
  });
};

export const subResourceIntegrityChecker = (dom: JSDOM): InspectionResult => {
  // get all script and link elements.
  const scriptElements = Array.from(
    dom.window.document.querySelectorAll("script")
  );

  const linkElements = Array.from(dom.window.document.querySelectorAll("link"));

  // check that all elements do contain the integrity attribute.
  const scriptElementsWithoutIntegrity =
    withoutIntegrityAttribute(scriptElements);
  const linkElementsWithoutIntegrity = withoutIntegrityAttribute(linkElements);

  // if there are elements without integrity, return false.
  if (
    scriptElementsWithoutIntegrity.length > 0 ||
    linkElementsWithoutIntegrity.length > 0
  ) {
    return new InspectionResult(
      ContentInspectionType.SubResourceIntegrity,
      false,
      {
        scriptElementsWithoutIntegrity: getSrcUrls(
          scriptElementsWithoutIntegrity
        ),
        linkElementsWithoutIntegrity: getSrcUrls(linkElementsWithoutIntegrity),
      }
    );
  }

  // check that all elements have a valid integrity prefix.
  const scriptElementsWithInvalidIntegrityPrefix =
    withoutValidIntegrityAttribute(scriptElements);

  const linkElementsWithInvalidIntegrityPrefix =
    withoutValidIntegrityAttribute(linkElements);

  // if there are elements with invalid integrity prefix, return false.
  if (
    scriptElementsWithInvalidIntegrityPrefix.length > 0 ||
    linkElementsWithInvalidIntegrityPrefix.length > 0
  ) {
    return new InspectionResult(
      ContentInspectionType.SubResourceIntegrity,
      false,
      {
        scriptElementsWithInvalidIntegrityPrefix: getSrcUrls(
          scriptElementsWithInvalidIntegrityPrefix
        ),
        linkElementsWithInvalidIntegrityPrefix: getSrcUrls(
          linkElementsWithInvalidIntegrityPrefix
        ),
      }
    );
  }

  // if all elements have integrity and a valid integrity prefix, return true.
  return new InspectionResult(
    ContentInspectionType.SubResourceIntegrity,
    true,
    {}
  );
};
