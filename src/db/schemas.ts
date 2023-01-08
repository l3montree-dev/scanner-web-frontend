import { Schema, SchemaTypes } from "mongoose";
import { InspectionTypeEnum } from "../inspection/scans";
import { IDashboard, INetwork, IReport, IUser } from "../types";

export const reportSchema = new Schema<IReport>(
  {
    fqdn: { type: SchemaTypes.String, index: true },
    duration: SchemaTypes.Number,
    result: SchemaTypes.Mixed,
    version: SchemaTypes.Number,
    validFrom: SchemaTypes.Number,
    lastScan: SchemaTypes.Number,
    ipV4AddressNumber: { type: SchemaTypes.Number, index: true },
  },
  { strict: true, timestamps: true }
);

export const dashboardSchema = new Schema<IDashboard>(
  {
    userId: { type: SchemaTypes.String, index: true, unique: true },
    historicalData: SchemaTypes.Mixed,
    currentState: SchemaTypes.Mixed,
    totals: SchemaTypes.Mixed,
  },
  { strict: true, timestamps: true }
);

export const userSchema = new Schema<Omit<IUser, "id"> & { _id: string }>(
  {
    _id: { type: SchemaTypes.String },
    role: SchemaTypes.String,
  },
  { strict: true, timestamps: true }
);

export const networkSchema = new Schema<INetwork>(
  {
    prefixLength: SchemaTypes.Number,
    networkAddress: SchemaTypes.String,
    startAddress: SchemaTypes.String,
    endAddress: SchemaTypes.String,
    startAddressNumber: SchemaTypes.String,
    endAddressNumber: SchemaTypes.String,
    cidr: { type: SchemaTypes.String, index: true, unique: true },
    comment: SchemaTypes.String,
  },
  { strict: true, timestamps: true }
);

const keys = Object.keys(InspectionTypeEnum);

export const domainSchema = new Schema(
  {
    fqdn: { type: SchemaTypes.String, index: true },
    ipV4Address: SchemaTypes.String,
    ipV6Address: [SchemaTypes.String],
    lastScan: { type: SchemaTypes.Number, index: true, default: null },
    ipV4AddressNumber: { type: SchemaTypes.Number, index: true },
    errorCount: SchemaTypes.Number,
    queued: { type: SchemaTypes.Boolean, default: false },
    ...keys.reduce((acc, key) => {
      acc[key] = { type: SchemaTypes.Boolean, default: null, index: true };
      return acc;
    }, {} as Record<string, any>),
  },
  { strict: true, timestamps: true }
);
