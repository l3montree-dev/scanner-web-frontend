import { Model, Schema, Types } from "mongoose";
import { IDashboard, IDomain, INetwork, IReport, IUser } from "../types";
import {
  dashboardSchema,
  domainSchema,
  networkSchema,
  reportSchema,
  userSchema,
} from "./schemas";

export const models: { [name: string]: Schema } = {
  Report: reportSchema,
  Domain: domainSchema,
  User: userSchema,
  Network: networkSchema,
  Dashboard: dashboardSchema,
};

export interface ModelsType {
  Report: Model<IReport>;
  User: Model<IUser>;
  Domain: Model<IDomain>;
  Network: Model<INetwork>;
  Dashboard: Model<IDashboard>;
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
