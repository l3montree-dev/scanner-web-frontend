import { Schema, SchemaTypes } from "mongoose";

export interface IReport {
  fqdn: string;
  duration: number;
  result: Record<string, any>;
  version: number;
}

// in the future, this should be modified, to match the real report, after the type is rather stable and not subject to change.
export const reportSchema = new Schema<IReport>(
  {
    fqdn: SchemaTypes.String,
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
  },
  { strict: true, timestamps: true }
);
