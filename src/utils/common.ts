import { IIpLookupProgressUpdate } from "../types";

export const serverOnly = <T>(fn: () => T): T | null => {
  if (typeof window === "undefined") {
    return fn();
  }
  return null;
};

export const isProgressMessage = (
  message: Record<string, any>
): message is IIpLookupProgressUpdate => {
  return "queued" in message;
};
