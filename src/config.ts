export const config = {
  isProduction: process.env.NODE_ENV === "production",
  clientTimeout: 30_000,
  clientRetries: 1,
};
