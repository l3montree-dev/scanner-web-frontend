import { Target } from "@prisma/client";
import { InspectionType, InspectResultDTO } from "./scanner/scans";

export enum FeatureFlag {
  collections = "collections",
}
export interface IDashboard {
  historicalData: CollectionStatMap;
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

export type CollectionStatMap = {
  [collectionId: number]: CollectionStat | undefined;
};
export type SingleCollectionStatMap = {
  [collectionId: number]: SingleCollectionStat | undefined;
};

export interface CollectionStat {
  series: Array<ChartData & { date: number }>;
  title: string;
  color: string;
}

export interface SingleCollectionStat {
  singleStat: ChartData & { date: number };
  title: string;
  color: string;
}

export interface INetworkPatchDTO {
  comment?: string;
}

export type IUserPutDTO = ICreateUserDTO & { id: string };

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
    username: string;
    email: string;
    image: string;
    id: string;
    // identifies a guest
    collectionId?: number;
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
  featureFlags: Record<FeatureFlag, boolean>;
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

export type DetailedTarget = Omit<
  Target,
  "lastScan" | "details" | "createdAt"
> & {
  details: DetailsJSON | null;
  lastScan: number;
  createdAt: string;
};

export interface Guest {
  // same as share link secret
  id: string;
  collectionId: number;
}

export interface UriDiff {
  uri: string;
  diff: {
    [key in InspectionType]?: {
      was: boolean | null;
      now: boolean | null;
    };
  };
}

export interface Diffs {
  uriDiffs: UriDiff[];
  start: number;
  end: number;
}
