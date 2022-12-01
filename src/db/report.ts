import { Schema, SchemaTypes } from "mongoose";
import { InspectionType, InspectResultDTO } from "../inspection/scans";

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

// in the future, this should be modified, to match the real report, after the type is rather stable and not subject to change.
export const detailedReportSchema = new Schema<IDetailedReport>(
  {
    fqdn: SchemaTypes.String,
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
    iconBase64: SchemaTypes.String,
  },
  { strict: true, timestamps: true }
);

export const compressedReportSchema = new Schema<ICompressedReport>(
  {
    fqdn: SchemaTypes.String,
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
  },
  { strict: true, timestamps: true }
);
