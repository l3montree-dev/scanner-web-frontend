import { Schema, SchemaTypes } from "mongoose";
import { InspectionType, InspectResultDTO } from "../inspection/Inspector";

export interface IReport {
  fqdn: string;
  duration: number;
  iconBase64: string;
  result: {
    [key in InspectionType]: InspectResultDTO;
  };
  version: number;
  createdAt: number;
  updatedAt: number;
}

// in the future, this should be modified, to match the real report, after the type is rather stable and not subject to change.
export const reportSchema = new Schema<IReport>(
  {
    fqdn: SchemaTypes.String,
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
    iconBase64: SchemaTypes.String,
  },
  { strict: true, timestamps: true }
);
