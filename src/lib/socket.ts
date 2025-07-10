import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const initiateSocket = (): void => {
  if (!socket) {
    console.log("🔄 Creating new socket connection...");
    
    socket = io("https://geekjives-26190134d520.herokuapp.com", {
      transports: ['websocket', 'polling'], // Add polling as fallback
      withCredentials: true,
      autoConnect: true, // Ensure auto-connect is enabled
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 5, // Limit reconnection attempts
      reconnectionDelay: 1000, // Delay between reconnection attempts
      timeout: 10000, // Connection timeout
    });

    // Add connection event listeners for debugging
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error);
    });

    console.log("🚀 Socket instance created");
  } else {
    console.log("♻️ Using existing socket connection");
  }
};

export const getSocket = (): Socket | undefined => {
  if (!socket) {
    console.log("⚠️ Socket not initialized, call initiateSocket() first");
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = undefined;
  }
};