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
  ipAddressNumber: number;
}

export interface Domain {
  fqdn: string;
  ipV4Address: string;
  ipV6Address: string;
  lastScan: number;
  // save the number representation of the v4 address as well
  // to make it easier to query for ranges
  ipV4AddressNumber: number;
}
export interface Network {
  prefixLength: number;
  networkAddress: string;
  startAddressNumber: number;
  endAddressNumber: number;
}

export interface IUser {
  _id: string; // match it with the id of the user inside the authorization server
  networks: Network[];
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
