import {
  IIpLookupProgressUpdateMsg,
  IIpLookupReportDTO,
  IIpLookupReportMsg,
  Network,
  Session,
} from "../types";

import ip from "ip";

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

export const isAdmin = (session: Session | null): boolean => {
  if (!session) {
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

  // make sure to keep the port if provided
  return url.port ? `${url.hostname}:${url.port}` : url.hostname;
};

export const classNames = (
  ...args: Array<string | boolean | undefined>
): string => {
  return args.filter(Boolean).join(" ");
};

export const parseNetwork = (cidr: string): Network => {
  const subnet = ip.cidrSubnet(cidr);

  return {
    prefixLength: subnet.subnetMaskLength,
    networkAddress: subnet.networkAddress,
    startAddress: subnet.firstAddress,
    endAddress: subnet.lastAddress,
    cidr,
    startAddressNumber: ip.toLong(subnet.firstAddress),
    endAddressNumber: ip.toLong(subnet.lastAddress),
  };
};
