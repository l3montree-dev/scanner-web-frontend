import CertificateInspector from "./certificate/CertificateInspector";
import ContentInspector from "./content/ContentInspector";
import CookieInspector from "./cookie/CookieInspector";
import DomainInspector from "./domain/DomainInspector";
import HttpInspector from "./http/HttpInspector";
import { InspectionType, InspectionResult } from "./Inspector";
import NetworkInspector from "./network/NetworkInspector";
import OrganizationalInspector from "./organizational/OrganizationalInspector";
import TLSInspector from "./tls/TLSInspector";

export class SiteInspector {
  private httpInspector: HttpInspector;
  private tlsInspector: TLSInspector;
  private certificateInspector: CertificateInspector;
  private cookieInspector: CookieInspector;
  private networkInspector: NetworkInspector;
  private domainInspector: DomainInspector;
  private organizationalInspector: OrganizationalInspector;
  private contentInspector: ContentInspector;

  constructor(protected readonly httpClient: typeof fetch) {
    // initialize all inspectors.
    // some inspectors might have other dependencies than others.
    this.httpInspector = new HttpInspector(httpClient);
    this.tlsInspector = new TLSInspector();
    this.certificateInspector = new CertificateInspector();
    this.cookieInspector = new CookieInspector();
    this.networkInspector = new NetworkInspector();
    this.domainInspector = new DomainInspector(httpClient);
    this.organizationalInspector = new OrganizationalInspector(httpClient);
    this.contentInspector = new ContentInspector();
  }

  async inspect(
    fqdn: string
  ): Promise<{ [type in InspectionType]: InspectionResult }> {
    // run all inspections -
    // use Promise all to execute them concurrently.
    const results = await Promise.all([
      this.httpInspector.inspect(fqdn),
      this.tlsInspector.inspect(fqdn),
      this.certificateInspector.inspect(fqdn),
      this.cookieInspector.inspect(fqdn),
      this.networkInspector.inspect(fqdn),
      this.domainInspector.inspect(fqdn),
      this.organizationalInspector.inspect(fqdn),
      this.contentInspector.inspect(fqdn),
    ]);

    // not using reduce here because it does not get all the types right.
    return {
      ...results[0],
      ...results[1],
      ...results[2],
      ...results[3],
      ...results[4],
      ...results[5],
      ...results[6],
      ...results[7],
    };
  }
}
