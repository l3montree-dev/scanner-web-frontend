import { resolve6 } from "dns/promises";
import { HttpClient } from "../services/clientHttpClient";

import { getLogger } from "../services/logger";
import { serverHttpClient } from "../services/serverHttpClient";
import { tlsClient } from "../services/tlsSocket";
import { buildInspectionError } from "../utils/error";
import { getIcon } from "../utils/icon";
import { getJSDOM } from "../utils/jsom";
import CertificateInspector from "./certificate/CertificateInspector";
import ContentInspector from "./content/ContentInspector";
import CookieInspector from "./cookie/CookieInspector";
import DomainInspector from "./domain/DomainInspector";
import HeaderInspector from "./header/HeaderInspector";
import HttpInspector from "./http/HttpInspector";
import {
  ContentInspectionType,
  InspectionType,
  InspectResultDTO,
} from "./Inspector";
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
const tlsInspector = new TLSInspector(tlsClient);
const certificateInspector = new CertificateInspector(tlsClient);

const jsdomExtractor = getJSDOM(serverHttpClient);

const logger = getLogger(__filename);
// makes sure, that the content is only parsed once.
const contentInspection = async (
  requestId: string,
  fqdn: string,
  httpClient: HttpClient
) => {
  try {
    const dom = await jsdomExtractor(requestId, fqdn);
    const icon = await getIcon(requestId, fqdn, dom, httpClient);
    return {
      icon,
      contentInspectionResult: contentInspector.inspect(requestId, dom),
    };
  } catch (e) {
    logger.error({ err: e, requestId }, "failed to extract content");
    return {
      icon: null,
      contentInspectionResult: buildInspectionError(ContentInspectionType, e),
    };
  }
};

export const inspect = async (requestId: string, fqdn: string) => {
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
    httpInspector.inspect(requestId, fqdn),
    headerInspector.inspect(requestId, fqdn),
    organizationalInspector.inspect(requestId, fqdn),
    domainInspector.inspect(requestId, fqdn),
    networkInspector.inspect(requestId, fqdn),
    contentInspection(requestId, fqdn, serverHttpClient),
    cookieInspector.inspect(requestId, fqdn),
    tlsInspector.inspect(requestId, fqdn),
    certificateInspector.inspect(requestId, fqdn),
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
    } as {
      [key in InspectionType]: InspectResultDTO;
    },
  };
};
