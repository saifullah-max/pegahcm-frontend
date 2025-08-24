// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // Replace with your backend URL if deployed

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // You’ll manually connect
});

export default socket;
