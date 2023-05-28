import { Server } from "socket.io";
import {
  Notification,
  NotificationAuthMessage,
  NotificationType,
} from "../notifications/notifications";
import { getLogger } from "../services/logger";
import crypto from "node:crypto";

let socketIOServer: Server | undefined;

const logger = getLogger(__filename);

const userNotificationTokenMap: Map<string, string> = new Map<string, string>();

const getNotificationToken = (userId: string): string => {
  const notificationToken = crypto.randomUUID();
  userNotificationTokenMap.set(userId, notificationToken);
  setTimeout(() => {
    // only delete the notification token if it is still the same
    if (userNotificationTokenMap.get(userId) === notificationToken) {
      // it is still the same.
      userNotificationTokenMap.delete(userId);
    }
  }, 5_000);

  return notificationToken;
};

// make sure to call this function before interacting with the notification system
const start = (socket: any): Server => {
  if (!socketIOServer) {
    socketIOServer = new Server(socket, { allowEIO3: true });
    console.log("CALLED");
    socketIOServer.on("connection", (socket) => {
      console.log("CONNECTED to realtime");
      // allow the client 5 seconds to authenticate - otherwise there might be open connections which would never receive
      // any messages
      const authTimeout = setTimeout(() => {
        socket.disconnect(true);
      }, 5_000);
      socket.on(NotificationType.AUTH, (req: NotificationAuthMessage) => {
        // we are expecting the notification token from the user.
        const userId = userNotificationTokenMap.get(
          req.payload.notificationToken
        );
        if (userId) {
          clearTimeout(authTimeout);
          return socket.join(userId);
        }
        // the token was wrong - disconnect the user
        socket.disconnect(true);
      });
    });
  }
  return socketIOServer;
};

// userId will be used for routing the event to the correct client -
// if the client is not connected nothing will happen
const notifyUser = (userId: string, notification: Notification<any>) => {
  if (!socketIOServer) {
    logger.warn(
      "notifyUser was called before the socket io server was started."
    );
    return;
  }
  socketIOServer.emit(userId, notification);
};

export const notificationServer = {
  start,
  notifyUser,
  getNotificationToken,
};
