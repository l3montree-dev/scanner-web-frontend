import mongoose from "mongoose";

let connection: Promise<mongoose.Mongoose> | null = null;
async function connect() {
  const dbUrl = process.env.MONGODB_URI;
  if (!dbUrl) {
    throw new Error("MONGODB_URI is not set");
  }
  connection = mongoose.connect(dbUrl);
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
  return connection;
}

export default function getConnection(): Promise<mongoose.Mongoose> {
  if (connection) {
    return connection;
  }
  return connect();
}
