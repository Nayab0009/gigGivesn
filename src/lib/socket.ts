import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const initiateSocket = (): void => {
  if (!socket) {
    console.log("🔄 Creating new socket connection...");
    
    socket = io("https://geekjives-26190134d520.herokuapp.com", {
      transports: ['websocket', 'polling'], 
      withCredentials: true,
      autoConnect: true, 
      reconnection: true, 
    });


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