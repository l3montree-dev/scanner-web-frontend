import { PrismaClient, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { DecoratedHandler, decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import MethodNotAllowed from "../../errors/MethodNotAllowed";

import {
  withCurrentUser,
  withCurrentUserOrGuest,
} from "../../decorators/withCurrentUser";
import { getLogger } from "../../services/logger";
import { reportService } from "../../services/reportService";
import { groupBy } from "lodash";
import { InspectionType } from "../../inspection/scans";
import { collectionService } from "../../services/collectionService";
import { Guest } from "../../types";
import ForbiddenException from "../../errors/ForbiddenException";
import { config } from "../../config";

const handleGet = async (
  req: NextApiRequest,
  currentUser: User | Guest,
  prisma: PrismaClient
) => {
  const inspection = req.query.inspectionType as InspectionType;
  const start = parseInt(req.query.start as string);
  const end = parseInt(req.query.end as string);
  const collectionIds = (req.query.collectionIds as string)
    .split(",")
    .map((d) => +d)
    .filter((id) => !config.generateStatsForCollections.includes(id));

  // check if the user has access to the collections
  const cols = (
    await collectionService.getAllCollectionsOfUser(currentUser, prisma)
  ).map((c) => c.id);

  const hasAccess = collectionIds.every((c) => cols.includes(c));
  if (!hasAccess) {
    throw new ForbiddenException();
  }

  const inspections = await reportService.getChangedInspectionsOfCollections(
    {
      start: new Date(start),
      end: new Date(end),
      page: 0,
      pageSize: 20,
      collectionIds,
    },
    prisma
  );

  // filter the inspections by the inspection type
  const filteredInspections = groupBy(
    inspections.uriDiffs
      .filter((d) => {
        return inspection in d.diff;
      })
      .map((d) => ({
        uri: d.uri,
        ...d.diff[inspection],
      })),
    "now"
  );

  return filteredInspections;
};
// exporting just for testing purposes.
export const handler: DecoratedHandler<[PrismaClient, User | Guest]> = async (
  req: NextApiRequest,
  res: NextApiResponse,
  [prisma, currentUser]
) => {
  switch (req.method) {
    case "GET":
      return handleGet(req, currentUser, prisma);
    default:
      throw new MethodNotAllowed();
  }
};

export default decorate(handler, withDB, withCurrentUserOrGuest);
