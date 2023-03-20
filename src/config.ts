export const config = {
  isProduction: process.env.NODE_ENV === "production",
  clientTimeout: 30_000,
  clientRetries: 1,
  statFirstDay: new Date(Date.UTC(2023, 0, 15)),
  generateStatsForCollections: (
    process.env.NEXT_PUBLIC_REFERENCE_COLLECTIONS ?? ""
  )
    .split(",")
    .map((d) => +d)
    .filter((d) => !isNaN(d))
    .filter((d) => d > 0),
  canonicalUrl: process.env.CANONICAL_URL,
};
