import { ModelsType, toDTO } from "../db/models";
import { AppUser, IDashboard, IUser } from "../types";
import { getLogger } from "./logger";
import { statService } from "./statService";

const logger = getLogger(__filename);

const pointsInTime = (start: Date, end: Date, dataPoints = 5) => {
  const timeDiff = end.getTime() - start.getTime();
  const dates = [start.getTime()];

  for (let i = 0; i < dataPoints; i++) {
    dates.push(dates[i] + timeDiff / dataPoints);
  }

  return dates;
};

const staleWhileRevalidate = async (
  currentUser: AppUser,
  admin: boolean,
  db: ModelsType
): Promise<IDashboard> => {
  const now = Date.now();

  const updatePromise = Promise.all([
    statService.getCurrentStatePercentage(
      admin,
      currentUser.networks,
      db.Domain
    ),
    statService.getTotals(admin, currentUser.networks, db.Domain),
    Promise.all(
      pointsInTime(
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        new Date(),
        2
      ).map(async (_, i, arr) => {
        const res = await statService.getFailedSuccessPercentage(
          admin,
          currentUser.networks,
          db.Report,
          {
            start: arr[i - 1] || 0,
            end: arr[i],
          }
        );
        return {
          ...res,
          date: arr[i],
        };
      })
    ),
  ]).then(
    async ([data, { uniqueDomains, dns, ipAddresses }, historicalData]) => {
      // create the new dashboard.
      const dashboard = await db.Dashboard.findOneAndUpdate(
        {
          userId: currentUser.id,
        },
        {
          userId: currentUser.id,
          currentState: data,
          totals: {
            uniqueDomains,
            dns,
            ipAddresses,
          },
          historicalData,
        },
        { upsert: true, new: true }
      ).lean();

      logger.info(
        {
          duration: Date.now() - now,
        },
        "dashboard updated"
      );
      return toDTO(dashboard);
    }
  );

  // check if a dashboard does already exist - otherwise we have to wait for the updatePromise
  const dashboard = await db.Dashboard.findOne({
    userId: currentUser.id,
  }).lean();
  if (dashboard) {
    return toDTO(dashboard);
  }
  logger.info("no cached dashboard - creating it");
  return updatePromise;
};

export const dashboardService = {
  staleWhileRevalidate,
};
