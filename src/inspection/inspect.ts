import { resolve6 } from "dns/promises";
import { config } from "../config";
import { HttpClient } from "../services/clientHttpClient";

import { getLogger } from "../services/logger";
import { httpClientFactory } from "../services/serverHttpClient";
import { tlsClient } from "../services/tlsSocket";
import { buildInspectionError } from "../utils/error";
import { getIcon } from "../utils/icon";
import { getJSDOM } from "../utils/jsdom";
import CertificateInspector from "./certificate/CertificateInspector";
import ContentInspector from "./content/ContentInspector";
import CookieInspector from "./cookie/CookieInspector";
import DomainInspector from "./domain/DomainInspector";
import HeaderInspector from "./header/HeaderInspector";
import HttpInspector from "./http/HttpInspector";
import {
  ContentInspectionType,
  HttpInspectionType,
  InspectionType,
  InspectResultDTO,
} from "./Inspector";
import NetworkInspector from "./network/NetworkInspector";
import OrganizationalInspector from "./organizational/OrganizationalInspector";
import TLSInspector from "./tls/TLSInspector";

const httpInspector = new HttpInspector();
const headerInspector = new HeaderInspector();
const organizationalInspector = new OrganizationalInspector();
const domainInspector = new DomainInspector();
const networkInspector = new NetworkInspector({
  resolve6,
});
const contentInspector = new ContentInspector();
const cookieInspector = new CookieInspector();
const tlsInspector = new TLSInspector(tlsClient);
const certificateInspector = new CertificateInspector(tlsClient);

const logger = getLogger(__filename);
// makes sure, that the content is only parsed once.
const contentInspection = async (
  requestId: string,
  fqdn: string,
  initialResponse: Response,
  httpClient: HttpClient
) => {
  try {
    const dom = await getJSDOM(initialResponse);
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
  const httpClient = httpClientFactory();
  // make the sanity check - if this request fails, we can't do anything.
  // besides that, it makes sure, that the http instance has all cookies set correctly.
  // nevertheless, the response can be reused by the checkers.
  const response = await httpClient(`https://${fqdn}`, requestId, undefined, {
    setCookies: true,
  });

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
    buildInspectionError(HttpInspectionType, new Error("not implemented")),
    //httpInspector.inspect(requestId, {
    //  fqdn,
    //  httpClient,
    //}),
    headerInspector.inspect(requestId, response),
    organizationalInspector.inspect(requestId, { fqdn, httpClient }),
    domainInspector.inspect(requestId, { fqdn, httpClient }),
    networkInspector.inspect(requestId, fqdn),
    contentInspection(requestId, fqdn, response, httpClient),
    cookieInspector.inspect(requestId, response),
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
