import io, { Socket } from "socket.io-client";
import {
  NotificationAuthMessage,
  NotificationType,
  Notification,
  NotificationMap,
} from "./notifications";
import { clientHttpClient } from "../services/clientHttpClient";

type NotificationListener = <T extends NotificationType>(
  notification: NotificationMap[T]
) => void;

let socket: Socket | undefined;

const notificationListeners: {
  [type in NotificationType]?: Array<{
    id: string;
    fn: (notification: Notification<any>) => void;
  }>;
} = {};

// the token should be retrieved by the "/api/v1/notifications" endpoint
const start = async (): Promise<Socket> => {
  if (!socket) {
    socket = io();
  }
  if (socket.disconnected) {
    // fetch the token.
    const res = await clientHttpClient(
      "/api/v1/notifications",
      crypto.randomUUID()
    );
    const { notificationToken } = await res.json();
    // make sure to reconnect
    socket.connect();

    const authMsg: NotificationAuthMessage = {
      type: NotificationType.AUTH,
      payload: {
        notificationToken,
      },
    };

    socket.emit(NotificationType.AUTH, authMsg);
    socket.onAny(
      (event: NotificationType, msg: NotificationMap[typeof event]) => {
        // call the registered listener
        const listenersArr = notificationListeners[event];
        listenersArr?.forEach(({ fn }) => fn(msg));
      }
    );
  }

  return socket;
};

const on = <T extends NotificationType>(
  type: T,
  {
    id,
    fn,
  }: {
    id: string;
    fn: NotificationListener;
  }
) => {
  if (!notificationListeners[type]) {
    notificationListeners[type] = [];
  }
  // check if the listener is already registered by id
  if (notificationListeners[type]?.some((l) => l.id === id)) {
    console.log("listener already registered - skipping");
    return;
  }
  notificationListeners[type]?.push({ fn, id });
};

export const notificationClient = {
  start,
  on,
};
