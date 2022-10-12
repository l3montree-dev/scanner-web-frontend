export const config = {
  isProduction: process.env.NODE_ENV === "production",
  serverTimeout: 3_000,
  serverRetries: 1,
  clientTimeout: 10_000,
  clientRetries: 1,
};
