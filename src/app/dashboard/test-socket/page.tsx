"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { initiateSocket, getSocket } from "@/lib/socket"

type MessageData = {
  userId?: string
  username?: string
  message: string
  timestamp?: number
}

type User = {
  id: string
  name: string
  status: "online" | "offline"
}

const staticUsers: User[] = [
  {
    id: "user1",
    name: "Alice Johnson",
    status: "online",
  },
  {
    id: "user2",
    name: "Bob Smith",
    status: "online",
  },
  {
    id: "user3",
    name: "Carol Davis",
    status: "offline",
  },
  {
    id: "user4",
    name: "David Wilson",
    status: "online",
  },
]

const getRandomRoomName = () => {
  // Pick a random user name from staticUsers as the room name
  const names = staticUsers.map(u => u.name)
  return names[Math.floor(Math.random() * names.length)]
}

const ChatApp = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<MessageData[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(staticUsers[0]) // Default select first user
  const [currentUserId] = useState("staticUser") // Current user ID
  const [roomName] = useState(getRandomRoomName())

  useEffect(() => {
    initiateSocket()
    const socket = getSocket()
    if (!socket) return

    // Listen for messages from server
    socket.on("message", (data: any) => {
      console.log("✅ Message received from server:", data)

      // Normalize the message format from server
      const normalizedMessage: MessageData = {
        userId: data.userId || currentUserId,
        username: data.username || "Anonymous",
        message: data.message,
        timestamp: data.timestamp || Date.now(),
      }

      // Add message to the global chat (all messages visible to all users)
      setMessages((prev) => [...prev, normalizedMessage])
    })

    // Clean up listener when component unmounts
    return () => {
      socket.off("message")
    }
  }, [currentUserId])

  const sendMessage = () => {
    const socket = getSocket()
    if (socket && input.trim() !== "") {
      const messageData = {
        userId: currentUserId,
        username: "You", // Or use actual username
        message: input,
        timestamp: Date.now(),
      }

      socket.emit("message", messageData)
      console.log("📤 Message sent:", messageData)
      setInput("")
    } else {
      console.warn("⚠️ Socket not connected or input is empty")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <div className="flex h-[600px] max-w-4xl mx-auto border rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Users Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold text-gray-800">Online Users</h2>
          <p className="text-sm text-gray-500">Room: {roomName}</p>
        </div>

        <div className="overflow-y-auto h-full">
          <div className="p-2">
            {staticUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? "bg-blue-100 border border-blue-200" : "hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              💬
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{roomName}</h3>
              <p className="text-sm text-gray-500">Welcome to the {roomName} chat room</p>
            </div>
          </div>
        </div>

        {/* Messages Area - Shows ALL messages to ALL users */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const messageUserId = msg.userId || msg.username || "unknown"
                const isCurrentUser = messageUserId === currentUserId
                const displayName = msg.username || msg.userId || "Anonymous"

                return (
                  <div key={index} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white" // Sent messages - Blue gradient
                          : "bg-gradient-to-r from-green-500 to-green-700 text-white" // Received messages - Green gradient
                      }`}
                    >
                      {!isCurrentUser && <p className="text-xs font-semibold mb-1 opacity-70">{displayName}</p>}
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-green-100"}`}>
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "now"}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">💡 Messages sent here will be visible to all users in real-time</p>
        </div>
      </div>
    </div>
  )
}

export default ChatApp
