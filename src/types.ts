import { InspectionType, InspectResultDTO } from "./inspection/scans";

export interface IReport {
  result: {
    [key in InspectionType]: InspectResultDTO;
  };
  iconBase64: string | null;
  validFrom: number;
  lastScan: number;
  fqdn: string;
  ipAddress: string;
  duration: number;
  version: number;
  createdAt: number;
  updatedAt: number;
  automated: boolean;
}

export interface IUser {
  id: string;
}

export type IIpLookupReportMsg = {
  results: { [ip: string]: string[] };
} & {
  cidr: string;
  requestId: string;
};

export interface IIpLookupRequestMsg {
  cidr: string;
  requestId: string;
  sendProgress?: boolean; // defaults to false
}

export interface IIpLookupProgressUpdateMsg {
  requestId: string;
  cidr: string;
  queued: number;
  processed: number;
  results: { [ip: string]: string[] };
}

export type IIpLookupProgressUpdateDTO = Omit<
  IIpLookupProgressUpdateMsg,
  "results"
> & { results: Array<{ domain: string; ip: string }> };

export type IIpLookupReportDTO = Omit<IIpLookupReportMsg, "results"> & {
  results: Array<{ domain: string; ip: string }>;
};

export interface Session {
  user: { name: string; email: string; image: string; id: string };
  roles: string[];
  accessToken: string;
}
