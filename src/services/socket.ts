import { io } from "socket.io-client";

const SOCKET_URL = "https://ems-backend-jkjx.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true, 
  reconnectionAttempts: 5, 
  reconnectionDelay: 1000, 
  transports: ["websocket", "polling"], 
});
