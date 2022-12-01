import { Model, Schema, Types } from "mongoose";
import {
  IDetailedReport,
  detailedReportSchema,
  ICompressedReport,
  compressedReportSchema,
} from "./report";

export const models: { [name: string]: Schema } = {
  DetailedReport: detailedReportSchema,
  CompressedReport: compressedReportSchema,
};

export interface ModelsType {
  DetailedReport: Model<IDetailedReport>;
  CompressedReport: Model<ICompressedReport>;
}

export type WithId<T> = Omit<T, "_id"> & { id: string };

export const serializeValue = (value: any): any => {
  if (value instanceof Date) {
    return value.getTime();
  }
  return value;
};

const shouldIncludeKey = (key: string): boolean => {
  return !key.startsWith("_");
};
export const toDTO = <T extends { _id: Types.ObjectId }>(
  model: T
): WithId<T> => {
  const { _id, ...rest } = model;
  return Object.entries(rest).reduce(
    (acc, [key, value]) => {
      if (!shouldIncludeKey(key)) {
        return acc;
      }
      return {
        ...acc,
        [key]: serializeValue(value),
      };
    },
    { id: _id.toHexString() } as WithId<T>
  );
};
