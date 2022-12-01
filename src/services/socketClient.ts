import io from "Socket.IO-client";

export const socket = io({
  autoConnect: false,
});
