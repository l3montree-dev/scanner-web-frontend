export const config = {
  isProduction: process.env.NODE_ENV === "production",
  clientTimeout: 30_000,
  clientRetries: 1,
  statFirstDay: new Date(2023, 0, 1),
  generateStatsForGroups: ["de_top_100000", "top_100000"],
};
