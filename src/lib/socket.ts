// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // Replace with your backend URL if deployed
console.log("SOCKET_URL", SOCKET_URL);

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // You’ll manually connect
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
