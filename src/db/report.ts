import { Schema, SchemaTypes } from "mongoose";
import { ICompressedReport, IDetailedReport } from "../types";

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
