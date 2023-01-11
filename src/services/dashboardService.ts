import { Dashboard, PrismaClient, User } from "@prisma/client";
import { getLogger } from "./logger";
import { statService } from "./statService";

const logger = getLogger(__filename);

const eachWeek = (start: Date, end: Date) => {
  const dates = [start.getTime()];

  let currentDate = start;
  while (currentDate <= end) {
    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    dates.push(Math.min(currentDate.getTime(), end.getTime()));
  }

  return dates;
};

const staleWhileRevalidate = async (
  currentUser: User,
  prisma: PrismaClient
): Promise<Dashboard> => {
  const now = Date.now();

  const updatePromise = Promise.all([
    statService.getCurrentStatePercentage(currentUser, prisma),
    statService.getTotalsOfUser(currentUser, prisma),
    Promise.all(
      eachWeek(
        // first of january in 2023
        new Date(2023, 0, 1),
        new Date()
      ).map(async (_, i, arr) => {
        const res = await statService.getFailedSuccessPercentage(
          currentUser,
          prisma,
          {
            end: arr[i],
          }
        );
        return {
          ...res,
          date: arr[i],
        };
      })
    ),
  ]).then(async ([data, { uniqueDomains }, historicalData]) => {
    // find the id of the last dashboard of this user.
    let lastDashboard = await prisma.dashboard.findFirst({
      where: {
        userId: currentUser.id,
      },
    });
    const d = {
      userId: currentUser.id,
      content: {
        currentState: data,
        totals: {
          uniqueDomains,
        },
        historicalData,
      },
    };
    if (!lastDashboard) {
      lastDashboard = await prisma.dashboard.create({
        data: d,
      });
    } else {
      await prisma.dashboard.update({
        where: { id: lastDashboard.id },
        data: d,
      });
      lastDashboard = {
        ...lastDashboard,
        ...d,
      };
    }

    logger.info(
      {
        duration: Date.now() - now,
      },
      "dashboard updated"
    );
    return lastDashboard;
  });

  // check if a dashboard does already exist - otherwise we have to wait for the updatePromise
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      userId: currentUser.id,
    },
  });

  if (dashboard && false) {
    return dashboard;
  }
  logger.info("no cached dashboard - creating it");
  return updatePromise;
};

export const dashboardService = {
  staleWhileRevalidate,
};
