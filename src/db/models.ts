import { Schema } from "mongoose";
import { reportSchema } from "./report";

export const models: { [name: string]: Schema } = {
  Report: reportSchema,
};
