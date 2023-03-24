import {
  CertificateInspectionType,
  ContentInspectionType,
  CookieInspectionType,
  DomainInspectionType,
  HeaderInspectionType,
  HttpInspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { DetailedTarget } from "../types";
import { DTO } from "../utils/server";
import { getDeprecatedTLSDeactivatedReportMessage } from "./deprecatedTLSDeactivated";
import { getDNSSecReportMessage } from "./dnsSec";
import { getHSTSReportMessage } from "./hsts";
import { getHttpMessage } from "./http";
import { getMatchesHostnameMessage } from "./matchesHostname";
import { getResponsibleDisclosureReportMessage } from "./responsibleDisclosure";
import getRPKIReportMessage from "./rpki";
import { getTLSv1_3ReportMessage } from "./tlsv1_3";
import { getValidCertificateMessage } from "./validCertificate";

export const messages = {
  [OrganizationalInspectionType.ResponsibleDisclosure]:
    getResponsibleDisclosureReportMessage,
  [TLSInspectionType.TLSv1_3]: getTLSv1_3ReportMessage,
  [TLSInspectionType.DeprecatedTLSDeactivated]:
    getDeprecatedTLSDeactivatedReportMessage,
  [HeaderInspectionType.HSTS]: getHSTSReportMessage,
  [DomainInspectionType.DNSSec]: getDNSSecReportMessage,
  [NetworkInspectionType.RPKI]: getRPKIReportMessage,
  [CertificateInspectionType.MatchesHostname]: getMatchesHostnameMessage,
  [CertificateInspectionType.ValidCertificate]: getValidCertificateMessage,
  [HttpInspectionType.HTTP]: getHttpMessage,
};

export const titleMapper = {
  [HttpInspectionType.HTTP]: "HTTP",
  [HttpInspectionType.HTTP308]: "HTTP moved permanently",
  [HttpInspectionType.HTTPRedirectsToHttps]: "HTTP Weiterleitung zu HTTPS",
  [TLSInspectionType.TLSv1_2]: "TLS 1.2",
  [TLSInspectionType.TLSv1_3]: "TLS 1.3",
  [TLSInspectionType.DeprecatedTLSDeactivated]:
    "Veraltetes TLS/ SSL deaktiviert",
  [TLSInspectionType.StrongKeyExchange]: "Strong-Key-Exchange",
  [TLSInspectionType.StrongCipherSuites]: "Strong-Cipher-Suites",
  [CertificateInspectionType.ValidCertificate]: "Gültiges Zertifikat",
  [CertificateInspectionType.StrongPrivateKey]: "Starker-Private-Key",
  [CertificateInspectionType.StrongSignatureAlgorithm]:
    "Starker Signatur Algorithmus",
  [CertificateInspectionType.MatchesHostname]:
    "Hostname Übereinstimmung im Zertifikat",
  [CertificateInspectionType.NotRevoked]:
    "Zertifikat wurde nicht zurückgerufen",
  [CertificateInspectionType.CertificateTransparency]: "Zertifikattransparenz",
  [CertificateInspectionType.ValidCertificateChain]: "Gültige Zertifikatskette",
  [CookieInspectionType.SecureSessionCookies]: "Sichere Session Cookies",
  [NetworkInspectionType.IPv6]: "IPv6",
  [NetworkInspectionType.RPKI]: "RPKI",
  [DomainInspectionType.DNSSec]: "DNSSEC",
  [DomainInspectionType.CAA]: "CAA",
  [OrganizationalInspectionType.ResponsibleDisclosure]:
    "Responsible Disclosure",
  [ContentInspectionType.SubResourceIntegrity]: "Sub Resource Integrity",
  [ContentInspectionType.NoMixedContent]: "Kein Mixed Content",
  [HeaderInspectionType.HTTPS]: "HTTPS",
  [HeaderInspectionType.HSTS]: "HSTS",
  [HeaderInspectionType.HSTSPreloaded]: "HSTS Preloaded",
  [HeaderInspectionType.ContentSecurityPolicy]: "Content Security Policy",
  [HeaderInspectionType.XFrameOptions]: "X-Frame-Options",
  [HeaderInspectionType.XSSProtection]: "X-XSS-Protection",
  [HeaderInspectionType.ContentTypeOptions]: "Content-Type-Options",
};

export const getCheckDescription = (
  report: DTO<DetailedTarget>,
  key: keyof typeof messages
): string => {
  return messages[key](report);
};
