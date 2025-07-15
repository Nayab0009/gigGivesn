import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

const getUserIdFromLocalStorage = (): string | undefined => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return undefined;
  try {
    const user = JSON.parse(userStr);
    return user?.id?.toString();
  } catch {
    return undefined;
  }
};

export const initiateSocket = (userId?: string): void => {
  // If userId is not provided, try to get it from localStorage
  const id = userId || getUserIdFromLocalStorage();
  if (!id) {
    console.error("❌ No userId found for socket connection.");
    return;
  }

  if (!socket) {
    console.log("🔄 Creating new socket connection...");

    socket = io("https://geekjives-26190134d520.herokuapp.com", {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      auth: {
        userId: id,
      },
    });

    console.log("👉 Sending userId to socket server in backend:", id);

    socket.on("connect", () => {
      console.log(
        `✅ Socket connected successfully. Socket ID: ${socket?.id}, User ID: ${id}`
      );
      // Emit user_connected event with userId
      socket?.emit("user_connected", { userId: id });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
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
