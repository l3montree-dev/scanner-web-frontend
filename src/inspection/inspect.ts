import { resolve6 } from "dns/promises";

import { getLogger } from "../services/logger";
import { serverHttpClient } from "../services/serverHttpClient";
import { tlsClient, tlsClientWithoutRetry } from "../services/tlsSocket";
import { buildInspectionError } from "../utils/error";
import { getIcon } from "../utils/icon";
import { getJSDOM } from "../utils/jsom";
import CertificateInspector from "./certificate/CertificateInspector";
import ContentInspector from "./content/ContentInspector";
import CookieInspector from "./cookie/CookieInspector";
import DomainInspector from "./domain/DomainInspector";
import HeaderInspector from "./header/HeaderInspector";
import HttpInspector from "./http/HttpInspector";
import { ContentInspectionType } from "./Inspector";
import NetworkInspector from "./network/NetworkInspector";
import OrganizationalInspector from "./organizational/OrganizationalInspector";
import TLSInspector from "./tls/TLSInspector";

const httpInspector = new HttpInspector(serverHttpClient);
const headerInspector = new HeaderInspector(serverHttpClient);
const organizationalInspector = new OrganizationalInspector(serverHttpClient);
const domainInspector = new DomainInspector(serverHttpClient);
const networkInspector = new NetworkInspector({
  resolve6,
});
const contentInspector = new ContentInspector();
const cookieInspector = new CookieInspector(serverHttpClient);
const tlsInspector = new TLSInspector(tlsClient, tlsClientWithoutRetry);
const certificateInspector = new CertificateInspector(tlsClient);

const jsdomExtractor = getJSDOM(serverHttpClient);

// makes sure, that the content is only parsed once.
const contentInspection = async (fqdn: string, httpClient: typeof fetch) => {
  try {
    const dom = await jsdomExtractor(fqdn);
    const icon = await getIcon(fqdn, dom, httpClient);
    return { icon, contentInspectionResult: contentInspector.inspect(dom) };
  } catch (e) {
    getLogger(__filename).error(e, "failed to extract content");
    return {
      icon: null,
      contentInspectionResult: buildInspectionError(ContentInspectionType, e),
    };
  }
};

export const inspect = async (fqdn: string) => {
  const [
    httpResult,
    headerResult,
    organizationalResult,
    domainResult,
    networkResult,
    { icon, contentInspectionResult },
    cookieResults,
    tlsResults,
    certificateResults,
  ] = await Promise.all([
    httpInspector.inspect(fqdn),
    headerInspector.inspect(fqdn),
    organizationalInspector.inspect(fqdn),
    domainInspector.inspect(fqdn),
    networkInspector.inspect(fqdn),
    contentInspection(fqdn, serverHttpClient),
    cookieInspector.inspect(fqdn),
    tlsInspector.inspect(fqdn),
    certificateInspector.inspect(fqdn),
  ]);

  return {
    icon,
    results: {
      ...httpResult,
      ...headerResult,
      ...organizationalResult,
      ...domainResult,
      ...networkResult,
      ...contentInspectionResult,
      ...cookieResults,
      ...tlsResults,
      ...certificateResults,
    },
  };
};
