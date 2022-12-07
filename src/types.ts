import { InspectionType, InspectResultDTO } from "./inspection/scans";

export interface IReport {
  fqdn: string;
  duration: number;
  version: number;
  createdAt: number;
  updatedAt: number;
}
export interface IDetailedReport extends IReport {
  iconBase64: string | null;
  result: {
    [key in InspectionType]: InspectResultDTO;
  };
}

export interface ICompressedReport extends IReport {
  result: {
    [key in InspectionType]: boolean;
  };
}

export type IIpLookupReport = {
  results: { [ip: string]: string[] };
} & {
  cidr: string;
  requestId: string;
};

export interface IpLookupRequest {
  cidr: string;
  requestId: string;
  sendProgress?: boolean; // defaults to false
}

export interface IIpLookupProgressUpdate {
  requestId: string;
  cidr: string;
  queued: number;
  processed: number;
  results: { [ip: string]: string[] };
}
