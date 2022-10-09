import { Schema, SchemaTypes } from "mongoose";
import { InspectionResult, InspectionType } from "../inspection/Inspector";

export interface IReport {
  fqdn: string;
  duration: number;
  iconHref: string;
  result: {
    [key in InspectionType]: InspectionResult;
  };
  version: number;
}

// in the future, this should be modified, to match the real report, after the type is rather stable and not subject to change.
export const reportSchema = new Schema<IReport>(
  {
    fqdn: SchemaTypes.String,
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
    iconHref: SchemaTypes.String,
  },
  { strict: true, timestamps: true }
);
