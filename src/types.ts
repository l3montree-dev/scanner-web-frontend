import { Target } from "@prisma/client";
import { InspectionType, InspectResultDTO } from "./inspection/scans";

export interface IDashboard {
  historicalData: Array<ChartData & { date: number }>;
  currentState: ChartData;
  totals: {
    uniqueTargets: number;
  };
}

export interface ChartData {
  data: {
    [key in InspectionType]: number;
  };
  totalCount: number;
}

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

export enum TargetType {
  all = "all",
  reachable = "reachable",
  unreachable = "unreachable",
}

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
  idToken: string;
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
  target: string;
  ipAddress: string;
  duration: number;
  timestamp: number;
  sut: string;
};

export type ErrorCode = "" | string;

export type IScanErrorResponse = {
  target: string;
  timestamp: number;
  ipAddress: string;
  duration: number;
  result: { error: { message: string; code: ErrorCode } };
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

export type DetailsJSON = IScanSuccessResponse["result"] & { sut: string };

export type DetailedTarget = Omit<Target, "lastScan" | "details"> & {
  details: DetailsJSON;
  lastScan: number;
};
