import { Schema } from "mongoose";

// use an empty schema.
// in the future, this should be modified, to match the real report, after the type is rather stable and not subject to change.
export const reportSchema = new Schema({}, { strict: false });
