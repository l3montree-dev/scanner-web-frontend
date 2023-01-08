import { ScanReport } from "@prisma/client";
import { InspectionType, InspectResultDTO } from "./inspection/scans";

export interface IDashboard {
  userId: string;
  historicalData: Array<ChartData & { date: number }>;
  currentState: ChartData;
  totals: {
    uniqueDomains: number;
  };
}

export interface ChartData {
  data: {
    [key in InspectionType]: number;
  };
  totalCount: number;
}

export type IDomain = {
  fqdn: string;
  ipV4Address: string;
  ipV6Address?: string[];
  lastScan: number | null;
  errorCount: number | null;
  // save the number representation of the v4 address as well
  // to make it easier to query for ranges
  ipV4AddressNumber: number;
} & { [key in InspectionType]: boolean | null };

export interface INetworkPatchDTO {
  comment?: string;
}

export type IUserPutDTO = ICreateUserDTO;

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

export interface ISession {
  user: {
    name: string;
    email: string;
    image: string;
    id: string;
    role: string;
  };
  resource_access: {
    [clientId: string]: {
      roles: string[];
    };
  };
  error?: string;
}

export interface IToken extends ISession {
  accessToken: string;
  refreshToken: string;
}

export interface ICreateUserDTO {
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

export type IScanSuccessResponse = {
  result: Partial<{
    [key in InspectionType]: InspectResultDTO;
  }>;
  fqdn: string;
  ipAddress: string;
  duration: number;
  timestamp: number;
};

export type DetailedScanReport = ScanReport & {
  details: IScanSuccessResponse["result"];
};

export type IScanErrorResponse = {
  fqdn: string;
  timestamp: number;
  ipAddress: string;
  duration: number;
  result: { error: any };
};

export type IScanResponse = IScanErrorResponse | IScanSuccessResponse;

export interface PaginateRequest {
  page: number;
  pageSize: number;
}

export interface PaginateResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type WithoutId<T> = Omit<T, "id">;
export interface IKcUser {
  id: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  attributes?: { role: string[] };
  notBefore: number;
}
