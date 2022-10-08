import { resolve6 } from "dns/promises";
import { fetchWithTimeout } from "../services/api";
import CertificateInspector from "./certificate/CertificateInspector";
import ContentInspector from "./content/ContentInspector";
import CookieInspector from "./cookie/CookieInspector";
import DomainInspector from "./domain/DomainInspector";
import HeaderInspector from "./header/HeaderInspector";
import HttpInspector from "./http/HttpInspector";
import NetworkInspector from "./network/NetworkInspector";
import OrganizationalInspector from "./organizational/OrganizationalInspector";
import TLSInspector from "./tls/TLSInspector";

const fetchClient = fetchWithTimeout(3_000);
const httpInspector = new HttpInspector(fetchClient);
const headerInspector = new HeaderInspector(fetchClient);
const organizationalInspector = new OrganizationalInspector(fetchClient);
const domainInspector = new DomainInspector(fetchClient);
const networkInspector = new NetworkInspector({
  resolve6,
});
const contentInspector = new ContentInspector(fetchClient);
const cookieInspector = new CookieInspector(fetchClient);
const tlsInspector = new TLSInspector();
const certificateInspector = new CertificateInspector();

export const inspect = async (fqdn: string) => {
  const [
    httpResult,
    headerResult,
    organizationalResult,
    domainResult,
    networkResult,
    contentResults,
    cookieResults,
    tlsResults,
    certificateResults,
  ] = await Promise.all([
    httpInspector.inspect(fqdn),
    headerInspector.inspect(fqdn),
    organizationalInspector.inspect(fqdn),
    domainInspector.inspect(fqdn),
    networkInspector.inspect(fqdn),
    contentInspector.inspect(fqdn),
    cookieInspector.inspect(fqdn),
    tlsInspector.inspect(fqdn),
    certificateInspector.inspect(fqdn),
  ]);

  return {
    ...httpResult,
    ...headerResult,
    ...organizationalResult,
    ...domainResult,
    ...networkResult,
    ...contentResults,
    ...cookieResults,
    ...tlsResults,
    ...certificateResults,
  };
};
