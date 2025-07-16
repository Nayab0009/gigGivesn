"use client"

import { useState, useEffect, useRef } from "react"
import {
  Send,
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  BellOff,
  Palette,
  MessageCircle,
  Search,
  MoreVertical,
  Smile,
} from "lucide-react"
import { colors } from "@/colors" // Assuming this file exists and exports colors
import { ShowEmployee } from "@/lib/TeamService" // Assuming this service exists
import { useAuth } from "@/context/AuthContext" // Assuming this context exists
import { initiateSocket, getSocket } from "@/lib/socket" // Assuming these socket functions exist

export default function ChatPage() {
  type Message = {
    message: string
    timestamp?: number
    userId?: string
    username?: string
  }

  const [message, setMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(true)
  const [fontSize, setFontSize] = useState("medium")
  const [isTyping, setIsTyping] = useState(false)
  const { user: currentUser } = useAuth()
  const currentRole = currentUser?.role
  const [contacts, setContacts] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return `bg-[${colors.accent.hex}]`
      case "away":
        return `bg-[${colors.highlight.hex}]`
      default:
        return `bg-gray-400`
    }
  }

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const themeClasses = theme === "dark" ? `bg-[${colors.primary.hex}] text-white` : "bg-white text-gray-900"

  const sidebarClasses =
    theme === "dark"
      ? `bg-[${colors.secondary.hex}] border-[${colors.primary.hex}]`
      : `bg-white border-[${colors.primary.hex}]`

  const fetchChatHistory = async (userA: string, userB: string) => {
    // Replace with your actual API endpoint and params
    const res = await fetch(`/api/messages?userA=${userA}&userB=${userB}`)
    const data = await res.json()
    setMessages(data.messages || [])
  }

  const getUserNameById = (userId: string) => {
    if (currentUser && userId === (currentUser.id ? currentUser.id.toString() : "")) return currentUser.name
    const contact = contacts.find((c) => c.id.toString() === userId)
    return contact?.name || userId
  }

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        let response
        if (currentRole === "manager") {
          response = await ShowEmployee("employee")
        } else if (currentRole === "employee") {
          response = await ShowEmployee("manager")
        }
        setContacts(response?.data || [])
      } catch (error) {
        setContacts([])
      }
    }
    if (currentRole) fetchContacts()
  }, [currentRole])

  useEffect(() => {
    if (contacts.length > 0 && !selectedUser) {
      setSelectedUser(contacts[0].name)
      setSelectedUserId(contacts[0].id)
    }
  }, [contacts, selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate typing indicator
  useEffect(() => {
    if (message.length > 0) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Initialize socket connection
  useEffect(() => {
    initiateSocket()
    const socket = getSocket()
    if (!socket) return

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
    })

    const handleMessage = (data: any) => {
      console.log("✅ Message received from server:", data)
      if (data && typeof data === "object" && typeof data.message === "string") {
        setMessages((prev) => [...prev, data])
      }
    }

    socket.on("message", handleMessage)

    return () => {
      socket.off("message", handleMessage)
    }
  }, [])

  const sendMessage = () => {
    const socket = getSocket()
    if (socket && message.trim() !== "") {
      const messageData = {
        message: message.trim(),
        timestamp: Date.now(),
        userId: currentUser?.id ? currentUser.id.toString() : undefined,
        username: currentUser?.name || undefined,
      }
      socket.emit("message", messageData)
      setMessages((prev) => [...prev, messageData])
      setMessage("")
    }
  }

  useEffect(() => {
    if (currentUser?.id && selectedUserId) {
      fetchChatHistory(currentUser.id.toString(), selectedUserId.toString())
    }
  }, [selectedUserId, currentUser])

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
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.secondary.hex }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
              style={{
                borderColor: colors.primary.hex,
                background: "#fff",
                color: colors.primary.hex,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id || contact.name}
              onClick={() => {
                setSelectedUser(contact.name)
                setSelectedUserId(contact.id)
              }}
              className={`p-4 cursor-pointer transition-all duration-200 border-b hover:bg-[${colors.accent.hex}22] ${
                selectedUser === contact.name
                  ? `bg-[${colors.primary.hex}11] border-r-2 border-r-[${colors.primary.hex}]`
                  : ""
              }`}
              style={{ borderColor: colors.primary.hex }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}
                  >
                    {contact.avatar ? contact.avatar : contact.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status || "online")}`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate" style={{ color: colors.primary.hex }}>
                      {contact.name}
                    </h3>
                    {contact.unread > 0 && (
                      <span className="bg-[${colors.warning.hex}] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: colors.secondary.hex }}>
                    {contact.status || "online"} • {contact.lastSeen || "now"}
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
        <header className="p-4 border-b" style={{ borderColor: colors.primary.hex, background: "#fff" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}
                >
                  {selectedUser[0]}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor("online")}`}
                ></div>
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: colors.primary.hex }}>
                  {selectedUser}
                </h2>
                <p className="text-sm" style={{ color: colors.secondary.hex }}>
                  {isTyping ? "typing..." : "Online"}
                </p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100" style={{ color: colors.primary.hex }}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: colors.accent.hex + "11" }}>
          {messages.map((msg, i) => {
            const isCurrentUserMessage = msg.userId === (currentUser?.id ? currentUser.id.toString() : "")
            const messageBubbleBg = isCurrentUserMessage
              ? `bg-[#0056b3] text-white` // Darker blue for sent messages, white text
              : `bg-[#1a2b3c] text-gray-200` // Dark blue for received messages, light gray text
            const messageBubbleRounded = isCurrentUserMessage ? "rounded-br-sm" : "rounded-bl-sm"

            return (
              <div key={i} className={`flex ${isCurrentUserMessage ? "justify-end" : "justify-start"}`}>
                <div className="max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm border ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"} ${messageBubbleBg} ${messageBubbleRounded}`}
                    style={{ borderColor: colors.primary.hex }}
                  >
                    <p>{msg.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t" style={{ borderColor: colors.primary.hex }}>
          <div className="flex items-end gap-3">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: colors.secondary.hex }}
            >
              <Smile className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                className="w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 resize-none max-h-32"
                style={{ borderColor: colors.primary.hex, color: colors.primary.hex }}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="p-3 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                color: "#fff",
                opacity: !message.trim() ? 0.5 : 1,
                cursor: !message.trim() ? "not-allowed" : "pointer",
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
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      {theme === "light" ? "Dark" : "Light"}
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
                    className={`p-2 rounded-full ${notifications ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-600"}`}
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
                      M
                    </div>
                    <div>
                      <p className="font-semibold">Me</p>
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
