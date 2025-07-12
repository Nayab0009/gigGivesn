"use client"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Send, Settings, User, Moon, Sun, Bell, BellOff, Palette, MessageCircle, Search, MoreVertical, Smile } from "lucide-react"
import { colors } from "@/colors"
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
  avatar?: string
  unread?: number
  lastSeen?: string
}

const staticUsers: User[] = [
  {
    id: "user1",
    name: "Noaman",
    status: "online",
    unread: 0,
    lastSeen: "now"
  },
  {
    id: "user2",
    name: "Saad",
    status: "online",
    unread: 2,
    lastSeen: "2 min ago"
  },
  {
    id: "user3",
    name: "Asim",
    status: "offline",
    unread: 0,
    lastSeen: "1 hour ago"
  },
  {
    id: "user4",
    name: "Fahad",
    status: "online",
    unread: 1,
    lastSeen: "5 min ago"
  },
]

const getRandomRoomName = () => {
  const names = staticUsers.map(u => u.name)
  return names[Math.floor(Math.random() * names.length)]
}

const ChatApp = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<MessageData[]>([])
  const [sentMessageIds, setSentMessageIds] = useState<Set<number>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(staticUsers[0])
  const [currentUserId] = useState("staticUser")
  const [roomName] = useState(getRandomRoomName())
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(true)
  const [fontSize, setFontSize] = useState("medium")
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (input.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [input]);

  useEffect(() => {
    initiateSocket()
    const socket = getSocket()
    if (!socket) return

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socket.on("message", (data: any) => {
      console.log("✅ Message received from server:", data)

      const normalizedMessage: MessageData = {
        userId: data.userId || currentUserId,
        username: data.username || "Anonymous",
        message: data.message,
        timestamp: data.timestamp || Date.now(),
      }

      setMessages((prev) => [...prev, normalizedMessage])
    })

    return () => {
      socket.off("message")
    }
  }, [currentUserId])

  const sendMessage = () => {
    const socket = getSocket()
    if (socket && input.trim() !== "") {
      const messageData = {
        userId: currentUserId,
        username: "You",
        message: input,
        timestamp: Date.now(),
      }

      socket.emit("message", messageData)
      console.log("📤 Message sent:", messageData)
      setSentMessageIds(prev => new Set(prev).add(messageData.timestamp))
      setInput("")
    } else {
      console.warn("⚠️ Socket not connected or input is empty")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return `bg-[${colors.accent.hex}]`;
      case 'away': return `bg-[${colors.highlight.hex}]`;
      default: return `bg-gray-400`;
    }
  };

  const filteredUsers = staticUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const themeClasses = theme === 'dark' 
    ? `bg-[${colors.primary.hex}] text-white` 
    : 'bg-white text-gray-900';

  const sidebarClasses = theme === 'dark'
    ? `bg-[${colors.secondary.hex}] border-[${colors.primary.hex}]`
    : `bg-white border-[${colors.primary.hex}]`;

  return (
    <div className={`flex h-screen ${themeClasses} transition-colors duration-200`}>
      {/* Sidebar */}
      <aside className={`w-80 ${sidebarClasses} border-r flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: colors.primary.hex }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-6 h-6" style={{ color: colors.primary.hex }} />
              <span style={{ color: colors.primary.hex }}>ChatPro</span>
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              style={{ color: colors.primary.hex }}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.secondary.hex }} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
              style={{
                borderColor: colors.primary.hex,
                background: '#fff',
                color: colors.primary.hex,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 cursor-pointer transition-all duration-200 border-b hover:bg-[${colors.accent.hex}22] ${
                selectedUser?.id === user.id ? `bg-[${colors.primary.hex}11] border-r-2 border-r-[${colors.primary.hex}]` : ''
              }`}
              style={{ borderColor: colors.primary.hex }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}>
                    {user.avatar ? user.avatar : user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate" style={{ color: colors.primary.hex }}>{user.name}</h3>
                    {user.unread && user.unread > 0 && (
                      <span className="bg-[${colors.warning.hex}] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {user.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: colors.secondary.hex }}>
                    {user.status} • {user.lastSeen}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-col flex-1">
        {/* Chat Header */}
        <header className="p-4 border-b" style={{ borderColor: colors.primary.hex, background: '#fff' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}>
                  {selectedUser?.name?.[0] || "?"}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedUser?.status || 'online')}`}></div>
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: colors.primary.hex }}>{selectedUser?.name || "Select User"}</h2>
                <p className="text-sm" style={{ color: colors.secondary.hex }}>
                  {isTyping ? 'typing...' : selectedUser?.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100" style={{ color: colors.primary.hex }}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: colors.accent.hex + '11' }}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isSentByMe = sentMessageIds.has(msg.timestamp!)
              const displayName = msg.username || msg.userId || "Anonymous"

              return (
                <div key={index} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${!isSentByMe ? "order-2" : ""}`}>
                    {!isSentByMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}>
                          {displayName[0]}
                        </div>
                        <span className="text-xs" style={{ color: colors.secondary.hex }}>{displayName}</span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isSentByMe
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm border"
                      } ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}
                      style={
                        isSentByMe
                          ? { background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }
                          : { borderColor: colors.primary.hex }
                      }
                    >
                      <p>{msg.message}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        isSentByMe ? "text-white justify-end" : "text-gray-500"
                      }`}>
                        <span>{msg.timestamp ? formatTime(new Date(msg.timestamp)) : "now"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t" style={{ borderColor: colors.primary.hex }}>
          <div className="flex items-end gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ color: colors.secondary.hex }}>
              <Smile className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                className="w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 resize-none max-h-32"
                style={{ borderColor: colors.primary.hex, color: colors.primary.hex }}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-3 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                color: '#fff',
                opacity: !input.trim() ? 0.5 : 1,
                cursor: !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Theme</span>
                    <button
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Font Size</span>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </h4>
                <div className="flex items-center justify-between">
                  <span>Enable Notifications</span>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`p-2 rounded-full ${notifications ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                  >
                    {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Profile Settings */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      Y
                    </div>
                    <div>
                      <p className="font-semibold">You</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatApp