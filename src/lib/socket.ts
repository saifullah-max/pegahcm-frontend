import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
console.log("[SOCKET] Using URL:", SOCKET_URL);

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"], // Keep both for fallback
});

socket.on("connect_error", (err) => {
  console.error("[SOCKET ERROR] Connection failed:", err.message);
});

export default socket;
