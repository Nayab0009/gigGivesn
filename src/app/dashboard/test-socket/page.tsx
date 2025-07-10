"use client";

import { useEffect, useState } from "react";
import { initiateSocket, getSocket } from "@/lib/socket";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ message: string; sender: string }[]>([]);
  const roomId = "room-1"; // Or dynamic from route/user

  useEffect(() => {
    initiateSocket();
    const socket = getSocket();

    if (!socket) return;

    // Join a room
    socket.emit("join", roomId);

    // Listen for incoming messages
    socket.on("chat-message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, []);

  const handleSend = () => {
    const socket = getSocket();
    if (message.trim()) {
      const msgData = { roomId, message, sender: "Me" };
      setChat((prev) => [...prev, msgData]); // Optimistic update
      socket?.emit("chat-message", msgData);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Chat Room</h2>
      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          marginBottom: "1rem",
          padding: "1rem",
        }}
      >
        {chat.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.sender}:</strong> {msg.message}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
