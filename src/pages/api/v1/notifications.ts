import { NextApiRequest, NextApiResponse } from "next";
import { notificationServer } from "../../../notifications/notificationServer";
import { authOptions } from "../../../nextAuthOptions";
import { getServerSession } from "next-auth";
import { ISession } from "../../../types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // @ts-expect-error
  notificationServer.start(req.socket.server);

  const { user } = (await getServerSession(req, res, authOptions)) as ISession;

  return res.json({
    notificationToken: notificationServer.getNotificationToken(user.id),
  });
}
