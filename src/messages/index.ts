import {
  CertificateInspectionType,
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
  [DomainInspectionType.DNSSec]: "DNSSEC",
  [NetworkInspectionType.RPKI]: "RPKI",
  [TLSInspectionType.TLSv1_3]: "TLS 1.3",
  [HttpInspectionType.HTTP]: "HTTP",
  [TLSInspectionType.DeprecatedTLSDeactivated]:
    "Deaktivierung von veralteten TLS/ SSL Protokollen",
  [HeaderInspectionType.HSTS]: "HSTS",
  [OrganizationalInspectionType.ResponsibleDisclosure]:
    "Responsible Disclosure",
  [CertificateInspectionType.MatchesHostname]:
    "Übereinstimmung des Hostnamens im Zertifikat",
  [CertificateInspectionType.ValidCertificate]: "Gültiges Zertifikat",
};

export const getCheckDescription = (
  report: DTO<DetailedTarget>,
  key: keyof typeof messages
): string => {
  return messages[key](report);
};
