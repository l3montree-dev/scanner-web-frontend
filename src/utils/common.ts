import {
  IIpLookupProgressUpdateMsg,
  IIpLookupReportDTO,
  IIpLookupReportMsg,
  IScanErrorResponse,
  IScanResponse,
  ISession,
  WithoutId,
} from "../types";

import { Network } from "@prisma/client";

import ip from "ip";
import {
  CertificateInspectionType,
  ContentInspectionType,
  CookieInspectionType,
  DomainInspectionType,
  HeaderInspectionType,
  HttpInspectionType,
  InspectionType,
  NetworkInspectionType,
  OrganizationalInspectionType,
  TLSInspectionType,
} from "../inspection/scans";
import { DTO } from "./server";
import { isValidIp, isValidMask } from "./validator";

export const serverOnly = <T>(fn: () => T): T | null => {
  if (typeof window === "undefined") {
    return fn();
  }
  return null;
};

export const isProgressMessage = (
  message: Record<string, any>
): message is IIpLookupProgressUpdateMsg => {
  return "queued" in message;
};

export const transformIpLookupMsg2DTO = (
  msg: IIpLookupReportMsg
): IIpLookupReportDTO => {
  return {
    ...msg,
    results: Object.entries(msg.results)
      .map(([ip, domains]) =>
        domains.map((domain) => ({
          ip,
          domain,
        }))
      )
      .flat(),
  };
};

export const isAdmin = (session: ISession | null | undefined): boolean => {
  if (!session || !session.resource_access) {
    return false;
  }
  return session?.resource_access["realm-management"]?.roles.includes(
    "realm-admin"
  );
};

export const promise2Boolean = async (promise: Promise<any>) => {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
};

export const wait = (delayMS: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, delayMS));
};

export const timeout = async <T>(
  promise: Promise<T>,
  timeoutMS = 3_000
): Promise<T> => {
  const result = await Promise.race([promise, wait(timeoutMS)]);
  if (!result) {
    throw new Error("timeout");
  }
  return result;
};

/**
 * @param providedValue Any value which should be sanitized as a FQDN
 * @returns The sanitized FQDN or null if the provided value is not a string
 */
export const sanitizeFQDN = (providedValue: any): string | null => {
  if (typeof providedValue !== "string" || !providedValue.includes(".")) {
    return null;
  }
  // add a protocol to the provided value, so that the URL constructor
  // can parse it correctly
  const url = new URL(
    providedValue.startsWith("https://") || providedValue.startsWith("http://")
      ? providedValue
      : `https://${providedValue}`
  );

  if (url.pathname !== "/") {
    return url.port
      ? `${url.hostname}:${url.port}${url.pathname}`
      : url.hostname + url.pathname;
  }

  // make sure to keep the port if provided
  return url.port ? `${url.hostname}:${url.port}` : url.hostname;
};

export const classNames = (
  ...args: Array<string | boolean | undefined>
): string => {
  return args.filter(Boolean).join(" ");
};

export const parseNetwork = (cidr: string): WithoutId<DTO<Network>> => {
  const subnet = ip.cidrSubnet(cidr);

  return {
    prefixLength: subnet.subnetMaskLength,
    networkAddress: subnet.networkAddress,
    startAddress: subnet.firstAddress,
    endAddress: subnet.lastAddress,
    cidr,
    comment: null,
    startAddressNumber: ip.toLong(subnet.firstAddress),
    endAddressNumber: ip.toLong(subnet.lastAddress),
  };
};

export const parseNetworkString = (networks: string | string[]): string[] => {
  // parse the networks - they are line separated
  const networksArray =
    networks instanceof Array ? networks : networks.trim().split("\n");
  // check if each network is in cidr notation.

  const networksValid = networksArray.every((network) => {
    const [ip, mask] = network.split("/");
    if (ip === undefined || mask === undefined) {
      return false;
    }
    const ipValid = isValidIp(ip);
    const maskValid = isValidMask(mask);
    return ipValid && maskValid;
  });
  if (!networksValid) {
    throw new Error("Bitte trage gültige Netzwerke ein.");
  }
  return networksArray;
};

export const isScanError = (
  response: IScanResponse
): response is IScanErrorResponse => {
  return "error" in response.result;
};

export const linkMapper: { [key in InspectionType]: string } = {
  [HttpInspectionType.HTTP]: "",
  [HttpInspectionType.HTTP308]: "",
  [HttpInspectionType.HTTPRedirectsToHttps]: "",
  [TLSInspectionType.TLSv1_2]: "",
  [TLSInspectionType.TLSv1_3]: "/one-pager/TLS1_3-One-Pager.pdf",
  [TLSInspectionType.TLSv1_1_Deactivated]:
    "/one-pager/TLS1_1_off-One-Pager.pdf",
  [TLSInspectionType.StrongKeyExchange]: "",
  [TLSInspectionType.StrongCipherSuites]: "",
  [CertificateInspectionType.ValidCertificate]: "",
  [CertificateInspectionType.StrongPrivateKey]: "",
  [CertificateInspectionType.StrongSignatureAlgorithm]: "",
  [CertificateInspectionType.MatchesHostname]: "",
  [CertificateInspectionType.NotRevoked]: "",
  [CertificateInspectionType.CertificateTransparency]: "",
  [CertificateInspectionType.ValidCertificateChain]: "",
  [CookieInspectionType.SecureSessionCookies]: "",
  [NetworkInspectionType.IPv6]: "",
  [NetworkInspectionType.RPKI]: "",
  [DomainInspectionType.DNSSec]: "/one-pager/DNSSEC-One-Pager.pdf",
  [DomainInspectionType.CAA]: "",
  [OrganizationalInspectionType.ResponsibleDisclosure]:
    "/one-pager/Responsible_Disclosure-One-Pager.pdf",
  [ContentInspectionType.SubResourceIntegrity]: "",
  [ContentInspectionType.NoMixedContent]: "",
  [HeaderInspectionType.HTTPS]: "",
  [HeaderInspectionType.HSTS]: "/one-pager/HSTS-One-Pager.pdf",
  [HeaderInspectionType.HSTSPreloaded]: "",
  [HeaderInspectionType.ContentSecurityPolicy]: "",
  [HeaderInspectionType.XFrameOptions]: "",
  [HeaderInspectionType.XSSProtection]: "",
  [HeaderInspectionType.ContentTypeOptions]: "",
};

export const neverThrow = async <T>(promise: Promise<T>): Promise<T | null> => {
  try {
    return await promise;
  } catch (e) {
    return null;
  }
};

export const dateFormat = {
  hour12: false,
  day: "2-digit" as const,
  month: "2-digit" as const,
  year: "2-digit" as const,
};
