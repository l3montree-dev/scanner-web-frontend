import { signOut } from "next-auth/react";
import {
  IIpLookupProgressUpdateMsg,
  IIpLookupReportDTO,
  IIpLookupReportMsg,
} from "../types";

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
