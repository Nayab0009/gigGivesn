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
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService" // Use the chatService sendMessage for fetching history

export default function ChatPage() {
  type Message = {
    message: string
    timestamp?: number
    userId?: string
    username?: string
    senderId?: string
    receiverId?: string
  }

  type EnhancedContact = {
    id: string | number
    name: string
    avatar?: string
    status?: string
    lastMessage?: string
    lastMessageTimestamp?: number
    unread: number
  }

  const [message, setMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string | number>("")
  const [showSettings, setShowSettings] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(true)
  const [fontSize, setFontSize] = useState("medium")
  const [isTyping, setIsTyping] = useState(false)
  const { user: currentUser } = useAuth()
  const currentRole = currentUser?.role
  const [contacts, setContacts] = useState<EnhancedContact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageCounter, setMessageCounter] = useState(0)
  const [contactMessages, setContactMessages] = useState<{[key: string]: Message[]}>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 86400000 // 24 hours in milliseconds
    
    if (date.getTime() >= today) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (date.getTime() >= yesterday) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
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

  // Sort contacts by most recent message first, then filter by search
  const filteredContacts = contacts
    .sort((a, b) => {
      // Sort by last message timestamp (most recent first)
      const timeA = a.lastMessageTimestamp || 0
      const timeB = b.lastMessageTimestamp || 0
      
      // If someone has unread messages, prioritize them
      if (a.unread > 0 && b.unread === 0) return -1
      if (b.unread > 0 && a.unread === 0) return 1
      
      return timeB - timeA
    })
    .filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const themeClasses = theme === "dark" ? `bg-[${colors.primary.hex}] text-white` : "bg-white text-gray-900"

  const sidebarClasses =
    theme === "dark"
      ? `bg-[${colors.secondary.hex}] border-[${colors.primary.hex}]`
      : `bg-white border-[${colors.primary.hex}]`

  const fetchChatHistory = async (receiverId: string, senderId: string) => {
    // Use the chatService POST function to fetch messages
    try {
      const data = await fetchChatHistoryAPI(senderId, receiverId)
      // Assume the response is an array of messages or has a messages property
      const messagesArray = Array.isArray(data) ? data : data.messages || []
      const mappedMessages = messagesArray.map((msg: any) => ({
        message: msg.messageBody,
        senderId: msg.sendBy?.id?.toString(),
        receiverId: msg.receivedBy?.id?.toString(),
        username: msg.sendBy?.name,
        timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : undefined,
      }))
      
      // Update current conversation messages
      setMessages(mappedMessages)
      
      // Update contact messages store
      if (mappedMessages.length > 0) {
        setContactMessages(prev => ({
          ...prev,
          [selectedUserId.toString()]: mappedMessages
        }))
        
        // Update the contact with last message info
        const lastMessage = mappedMessages[mappedMessages.length - 1]
        if (lastMessage) {
          setContacts(prevContacts => {
            return prevContacts.map(contact => {
              if (contact.id.toString() === selectedUserId.toString()) {
                return {
                  ...contact,
                  lastMessage: lastMessage.message,
                  lastMessageTimestamp: lastMessage.timestamp,
                  unread: 0 // Reset unread when viewing history
                }
              }
              return contact
            })
          })
        }
      }
    } catch (error) {
      setMessages([])
    }
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
        
        // Enhance contacts with message data
        const enhancedContacts = (response?.data || []).map((contact: any) => ({
          ...contact,
          lastMessage: '',
          lastMessageTimestamp: undefined,
          unread: 0
        }))
        
        setContacts(enhancedContacts)
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
      console.log("[RECEIVED PAYLOAD]", data)
      // Increment message counter for tracking
      setMessageCounter(prev => prev + 1)
      
      // Only add messages where current user is either the sender or receiver
      if (data && typeof data === "object" && typeof data.message === "string") {
        const currentUserId = currentUser?.id?.toString()
        
        // Update contact messages for all relevant contacts
        if (data.senderId === currentUserId || data.receiverId === currentUserId) {
          // Determine which contact this message belongs to
          const contactId = data.senderId === currentUserId ? data.receiverId : data.senderId
          
          // Update contact messages
          setContactMessages(prev => {
            const existingMessages = prev[contactId] || []
            return {
              ...prev,
              [contactId]: [...existingMessages, data]
            }
          })
          
          // Update contacts list with last message
          setContacts(prevContacts => {
            return prevContacts.map(contact => {
              if (contact.id.toString() === contactId) {
                // If message is from someone else to current user, increment unread
                const isUnread = data.senderId !== currentUserId && 
                                 contact.id.toString() !== selectedUserId.toString()
                return {
                  ...contact,
                  lastMessage: data.message,
                  lastMessageTimestamp: data.timestamp,
                  unread: isUnread ? (contact.unread || 0) + 1 : contact.unread
                }
              }
              return contact
            })
          })
        }
        
        // Only show messages in the current conversation
        if (
          (data.senderId === currentUserId || data.receiverId === currentUserId) &&
          (data.senderId === selectedUserId.toString() || data.receiverId === selectedUserId.toString())
        ) {
          console.log(`Message #${messageCounter} accepted: currentUserId=${currentUserId}, senderId=${data.senderId}, receiverId=${data.receiverId}`)
          setMessages((prev) => [...prev, data])
          
          // Reset unread for this contact when it's the selected one
          setContacts(prevContacts => {
            return prevContacts.map(contact => {
              if (contact.id.toString() === selectedUserId.toString()) {
                return { ...contact, unread: 0 }
              }
              return contact
            })
          })
        } else {
          console.log(`Message #${messageCounter} filtered out: currentUserId=${currentUserId}, senderId=${data.senderId}, receiverId=${data.receiverId}`)
        }
      }
    }

    socket.on("message", handleMessage)

    return () => {
      socket.off("message", handleMessage)
    }
  }, [selectedUserId, currentUser])

  const sendMessage = () => {
    const socket = getSocket()
    if (socket && message.trim() !== "") {
      const messageData = {
        message: message.trim(),
        timestamp: Date.now(),
        userId: currentUser?.id ? currentUser.id.toString() : undefined,
        username: currentUser?.name || undefined,
        senderId: currentUser?.id ? currentUser.id.toString() : undefined,
        receiverId: selectedUserId ? selectedUserId.toString() : undefined,
      }
      console.log("[SEND PAYLOAD]", messageData)
      socket.emit("message", messageData)
      
      // Update messages in the current conversation
      setMessages((prev) => [...prev, messageData])
      
      // Update contact messages
      if (selectedUserId) {
        setContactMessages(prev => {
          const existingMessages = prev[selectedUserId.toString()] || []
          return {
            ...prev,
            [selectedUserId.toString()]: [...existingMessages, messageData]
          }
        })
        
        // Update contacts list with last message
        setContacts(prevContacts => {
          return prevContacts.map(contact => {
            if (contact.id.toString() === selectedUserId.toString()) {
              return {
                ...contact,
                lastMessage: messageData.message,
                lastMessageTimestamp: messageData.timestamp
              }
            }
            return contact
          })
        })
      }
      
      setMessage("")
    }
  }

  useEffect(() => {
    if (currentUser?.id && selectedUserId) {
      // Fetch messages for the conversation between current user and selected user
      console.log(`Fetching chat history between users ${currentUser.id} and ${selectedUserId}`)
      fetchChatHistory(currentUser.id.toString(), selectedUserId.toString())
    }
  }, [selectedUserId, currentUser?.id])

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
                // Reset unread when selecting a contact
                setContacts(prevContacts => 
                  prevContacts.map(c => 
                    c.id === contact.id ? {...c, unread: 0} : c
                  )
                )
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
                  {contact.status && (
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}
                    ></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate" style={{ color: colors.primary.hex }}>
                      {contact.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {contact.lastMessageTimestamp && (
                        <span className="text-xs text-gray-500">
                          {formatTime(new Date(contact.lastMessageTimestamp))}
                        </span>
                      )}
                      {contact.unread > 0 && (
                        <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center" style={{ backgroundColor: colors.primary.hex }}>
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm truncate text-gray-600" style={{ 
                    fontWeight: contact.unread > 0 ? 'bold' : 'normal',
                    color: contact.unread > 0 ? colors.primary.hex : 'inherit'
                  }}>
                    {contact.lastMessage ? (
                      <>
                        {contact.lastMessageTimestamp && getUserNameById(contact.id.toString()) !== selectedUser ? (
                          <span className="font-medium mr-1">You:</span>
                        ) : null}
                        {contact.lastMessage}
                      </>
                    ) : "No messages yet"}
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
                {/* <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor("online")}`}
                ></div> */}
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: colors.primary.hex }}>
                  {selectedUser} 
                </h2>
                {/* <p className="text-sm" style={{ color: colors.secondary.hex }}>
                  {isTyping ? "typing..." : "Online"}
                </p> */}
              </div>
            </div>
            {/* <div className="flex items-center">
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className="p-2 rounded-full hover:bg-gray-100 mr-2" 
                title="Show debug info"
                style={{ color: colors.secondary.hex }}
              >
                <div className="flex items-center">
                  <span className="text-xs mr-1">💬 {messageCounter}</span>
                </div>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100" style={{ color: colors.primary.hex }}>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div> */}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: colors.accent.hex + "11" }}>
          {messages.map((msg, i) => {
            const isSentByMe = msg.senderId === (currentUser?.id ? currentUser.id.toString() : undefined)
            let senderName = ''
            if (!isSentByMe && msg.senderId) {
              const contact = contacts.find(c => c.id.toString() === msg.senderId)
              senderName = contact?.name || msg.username || `User ${msg.senderId}`
            }
            return (
              <div
                key={i}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${!isSentByMe ? 'order-2' : ''}`}>
                  {/* Show sender name and ID for received messages */}
                  {!isSentByMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}>
                        {senderName[0] || '?'}
                      </div>
                      <span className="text-xs" style={{ color: colors.secondary.hex }}>
                        {senderName} 
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${isSentByMe ? 'bg-blue-100' : 'bg-white'} text-gray-900 rounded-bl-sm border ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}
                    style={{ borderColor: colors.primary.hex }}
                  >
                    <p>{msg.message}</p>
                    {msg.timestamp && (
                      <p className="text-xs text-right mt-1 text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    )}
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
            {/* <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: colors.secondary.hex }}
            >
              <Smile className="w-5 h-5" />
            </button> */}
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

      {/* Debug Panel */}
      {/* {showDebug && (
        <div className="fixed bottom-0 right-0 bg-black bg-opacity-80 text-white p-4 rounded-tl-lg max-w-md max-h-[40vh] overflow-auto z-50 font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3>Debug Information</h3>
            <button onClick={() => setShowDebug(false)} className="text-white hover:text-red-400">✕</button>
          </div>
          <div className="space-y-2">
            <p>Current User ID: {currentUser?.id}</p>
            <p>Selected User ID: {selectedUserId}</p>
            <p>Messages Received: {messageCounter}</p>
            <p>Messages Displayed: {messages.length}</p>
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="font-bold">Message IDs:</p>
              <ul className="list-disc pl-4 mt-1">
                {messages.slice(-5).map((msg, i) => (
                  <li key={i}>
                    From: {msg.senderId} → To: {msg.receiverId} ({new Date(msg.timestamp || 0).toLocaleTimeString()})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}