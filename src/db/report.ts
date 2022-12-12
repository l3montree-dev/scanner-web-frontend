import { Schema, SchemaTypes } from "mongoose";
import { IReport } from "../types";

export const reportSchema = new Schema<IReport>(
  {
    fqdn: { type: SchemaTypes.String, index: true },
    ipAddress: { type: SchemaTypes.String, index: true },
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
    validFrom: SchemaTypes.Number,
    lastScan: SchemaTypes.Number,
  },
  { strict: true, timestamps: true }
);

export const userSchema = new Schema({});
