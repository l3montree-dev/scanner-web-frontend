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
  ipV4AddressNumber: number;
}

export interface IDomain {
  fqdn: string;
  ipV4Address: string;
  lastScan: number | null;
  errorCount: number | null;
  // save the number representation of the v4 address as well
  // to make it easier to query for ranges
  ipV4AddressNumber: number;
}
export interface INetwork {
  prefixLength: number;
  networkAddress: string;
  startAddress: string;
  endAddress: string;
  startAddressNumber: number;
  endAddressNumber: number;
  cidr: string;
  comment?: string;
  id: string;
}

export interface IUser {
  _id: string; // match it with the id of the user inside the authorization server
  networks: INetwork[];
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

export interface ISession {
  user: {
    name: string;
    email: string;
    image: string;
    id: string;
    networks: INetwork[];
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
  networks: string[]; // CIDR notation
  role: string;
}

export type IScanSuccessResponse = {
  result: IReport["result"];
  fqdn: string;
  icon: string;
  ipAddress?: string;
  duration: number;
  timestamp: number;
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

export type WithoutId<T> = Omit<T, "_id" | "id">;
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
