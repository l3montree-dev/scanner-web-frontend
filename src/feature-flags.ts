export const featureFlags = {
  disableRefresh: process.env.NEXT_PUBLIC_DISABLE_REFRESH === "true",
  disableDashboard: process.env.NEXT_PUBLIC_DISABLE_DASHBOARD === "true",
};
