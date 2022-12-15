import { Schema, SchemaTypes } from "mongoose";
import { IReport, IUser } from "../types";

export const reportSchema = new Schema<IReport>(
  {
    fqdn: { type: SchemaTypes.String, index: true },
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
    validFrom: SchemaTypes.Number,
    lastScan: SchemaTypes.Number,
    ipAddressNumber: { type: SchemaTypes.Number, index: true },
  },
  { strict: true, timestamps: true }
);

export const userSchema = new Schema<IUser>(
  {
    networks: SchemaTypes.Mixed,
  },
  { strict: true, timestamps: true }
);

export const domainSchema = new Schema(
  {
    fqdn: { type: SchemaTypes.String, index: true },
    ipV4Address: SchemaTypes.String,
    ipV6Address: SchemaTypes.String,
    lastScan: { type: SchemaTypes.Number, index: true },
    ipV4AddressNumber: { type: SchemaTypes.Number, index: true },
  },
  { strict: true, timestamps: true }
);
