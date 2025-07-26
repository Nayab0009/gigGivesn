"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Settings, User, Moon, Sun, Bell, BellOff, Palette, MessageCircle, Search, Paperclip } from "lucide-react"
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
    fileUrl?: string // Added for file/image attachments
    fileType?: string // Added for file/image attachments
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // New state for selected file
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref for file input
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string | number>("")
  const [showSettings, setShowSettings] = useState(false)
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
  const [contactMessages, setContactMessages] = useState<{ [key: string]: Message[] }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null) // Ref for the audio element

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }

  // Helper functions to save and load read status
  const saveReadStatus = (contactId: string | number) => {
    try {
      // Get existing read status
      const savedReadStatus = localStorage.getItem("chatReadStatus") || "{}"
      const readStatus = JSON.parse(savedReadStatus)
      // Mark this contact as read
      readStatus[contactId.toString()] = true
      // Save back to localStorage
      localStorage.setItem("chatReadStatus", JSON.stringify(readStatus))
    } catch (error) {
      console.error("Error saving read status:", error)
    }
  }

  const loadReadStatus = () => {
    try {
      const savedReadStatus = localStorage.getItem("chatReadStatus") || "{}"
      return JSON.parse(savedReadStatus)
    } catch (error) {
      console.error("Error loading read status:", error)
      return {}
    }
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
        fileUrl: msg.fileUrl || undefined, // Assuming backend provides this
        fileType: msg.fileType || undefined, // Assuming backend provides this
      }))
      // Update current conversation messages
      setMessages(mappedMessages)
      // Update contact messages store
      if (mappedMessages.length > 0) {
        setContactMessages((prev) => ({
          ...prev,
          [selectedUserId.toString()]: mappedMessages,
        }))
        // Update the contact with last message info
        const lastMessage = mappedMessages[mappedMessages.length - 1]
        if (lastMessage) {
          // Mark this contact as read when viewing history
          saveReadStatus(selectedUserId)
          setContacts((prevContacts) => {
            return prevContacts.map((contact) => {
              if (contact.id.toString() === selectedUserId.toString()) {
                return {
                  ...contact,
                  lastMessage: lastMessage.message,
                  lastMessageTimestamp: lastMessage.timestamp,
                  unread: 0, // Reset unread when viewing history
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

  // Helper function to fetch latest message for a contact
  const fetchLatestMessage = async (userId: string, contactId: string) => {
    try {
      const data = await fetchChatHistoryAPI(userId, contactId)
      const messagesArray = Array.isArray(data) ? data : data.messages || []
      if (messagesArray.length > 0) {
        // Get the most recent message
        const latestMsg = messagesArray[messagesArray.length - 1]
        return {
          message: latestMsg.messageBody,
          senderId: latestMsg.sendBy?.id?.toString(),
          timestamp: latestMsg.createdAt ? new Date(latestMsg.createdAt).getTime() : Date.now(),
          fileUrl: latestMsg.fileUrl || undefined, // Assuming backend provides this
          fileType: latestMsg.fileType || undefined, // Assuming backend provides this
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching latest message:", error)
      return null
    }
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
        // First set basic contacts to prevent long loading
        const basicContacts = (response?.data || []).map((contact: any) => ({
          ...contact,
          lastMessage: "",
          lastMessageTimestamp: undefined,
          unread: 0,
        }))
        setContacts(basicContacts)
        // Then fetch last message for each contact
        if (currentUser?.id) {
          const userId = currentUser.id.toString()
          const updatedContacts = [...basicContacts]
          // Load saved read status
          const readStatus = loadReadStatus()
          // Using Promise.all to fetch all messages in parallel
          const messagePromises = basicContacts.map(async (contact: EnhancedContact, index: number) => {
            const latestMessage = await fetchLatestMessage(userId, contact.id.toString())
            if (latestMessage) {
              // Check if this contact is marked as read in localStorage
              const isRead = readStatus[contact.id.toString()] === true
              updatedContacts[index] = {
                ...updatedContacts[index],
                lastMessage: latestMessage.message,
                lastMessageTimestamp: latestMessage.timestamp,
                // If the last message is from the other person and not read, mark as unread
                unread: latestMessage.senderId !== userId && !isRead ? 1 : 0,
              }
            }
            return null // Just to satisfy the promise mapping
          })
          // Wait for all message fetches to complete
          await Promise.all(messagePromises)
          // Update contacts with the latest messages
          setContacts(updatedContacts)
        }
      } catch (error) {
        console.error("Error fetching contacts:", error)
        setContacts([])
      }
    }
    if (currentRole && currentUser?.id) fetchContacts()
  }, [currentRole, currentUser?.id])

  useEffect(() => {
    if (contacts.length > 0 && !selectedUser) {
      setSelectedUser(contacts[0].name)
      setSelectedUserId(contacts[0].id)
    }
  }, [contacts, selectedUser])

  useEffect(() => {
    // Always scroll to bottom when messages change
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

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

    const handleMessage = (data: Message) => {
      // Type data as Message
      console.log("✅ Message received from server:", data)
      console.log("[RECEIVED PAYLOAD]", data)
      // Increment message counter for tracking
      setMessageCounter((prev) => prev + 1)
      // Only add messages where current user is either the sender or receiver
      if (data && typeof data === "object") {
        // Message string is optional now
        const currentUserId = currentUser?.id?.toString()
        // Update contact messages for all relevant contacts
        if (data.senderId === currentUserId || data.receiverId === currentUserId) {
          // Determine which contact this message belongs to
          const contactId = data.senderId === currentUserId ? data.receiverId : data.senderId
          // Play audio if notifications are enabled and the message is from someone else
          if (notifications && data.senderId !== currentUserId && audioRef.current) {
            audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
          }
          // Update contact messages
          setContactMessages((prev) => {
            const existingMessages = prev[contactId] || []
            return {
              ...prev,
              [contactId]: [...existingMessages, data],
            }
          })
          // Update contacts list with last message
          setContacts((prevContacts) => {
            return prevContacts.map((contact) => {
              if (contact.id.toString() === contactId) {
                // If message is from someone else to current user, increment unread
                // But only if this contact is not currently selected
                const isUnread = data.senderId !== currentUserId && contact.id.toString() !== selectedUserId.toString()
                // If this is the selected contact, mark it as read in localStorage
                if (contact.id.toString() === selectedUserId.toString()) {
                  saveReadStatus(contact.id)
                }
                return {
                  ...contact,
                  lastMessage:
                    data.message ||
                    (data.fileType ? `Sent a ${data.fileType.startsWith("image/") ? "photo" : "file"}` : "New message"), // Update last message for contact
                  lastMessageTimestamp: data.timestamp,
                  unread: isUnread ? (contact.unread || 0) + 1 : contact.unread,
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
          console.log(
            `Message #${messageCounter} accepted: currentUserId=${currentUserId}, senderId=${data.senderId}, receiverId=${data.receiverId}`,
          )
          setMessages((prev) => [...prev, data])
          // Reset unread for this contact when it's the selected one
          setContacts((prevContacts) => {
            return prevContacts.map((contact) => {
              if (contact.id.toString() === selectedUserId.toString()) {
                // Mark as read in localStorage
                saveReadStatus(contact.id)
                return { ...contact, unread: 0 }
              }
              return contact
            })
          })
        } else {
          console.log(
            `Message #${messageCounter} filtered out: currentUserId=${currentUserId}, senderId=${data.senderId}, receiverId=${data.receiverId}`,
          )
        }
      }
    }
    socket.on("message", handleMessage)
    return () => {
      socket.off("message", handleMessage)
    }
  }, [selectedUserId, currentUser, notifications]) // Removed messageCounter from dependencies to prevent unnecessary re-syncing [^4]

  const sendMessage = () => {
    const socket = getSocket()
    if (socket && (message.trim() !== "" || selectedFile)) {
      // Allow sending if only file is present
      if (selectedFile) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const fileDataUrl = reader.result as string
          const messageData: Message = {
            // Ensure type safety
            message: message.trim(), // Can be empty if only file is sent
            timestamp: Date.now(),
            userId: currentUser?.id ? currentUser.id.toString() : undefined,
            username: currentUser?.name || undefined,
            senderId: currentUser?.id ? currentUser.id.toString() : undefined,
            receiverId: selectedUserId ? selectedUserId.toString() : undefined,
           fileUrl: "https://res.cloudinary.com/dkpo8ys7l/image/upload/v1742172116/whrq4ytd1qhiwqihddnz.jpg",
            fileType: selectedFile.type, // Include file type
          }
          console.log("[SEND PAYLOAD]", messageData)
          socket.emit("message", messageData)

          // Update messages in the current conversation
          setMessages((prev) => [...prev, messageData])
          setTimeout(scrollToBottom, 0)

          // Mark the conversation as read when sending a message
          if (selectedUserId) {
            saveReadStatus(selectedUserId)
          }

          // Update contact messages
          if (selectedUserId) {
            setContactMessages((prev) => {
              const existingMessages = prev[selectedUserId.toString()] || []
              return {
                ...prev,
                [selectedUserId.toString()]: [...existingMessages, messageData],
              }
            })
            // Update contacts list with last message
            setContacts((prevContacts) => {
              return prevContacts.map((contact) => {
                if (contact.id.toString() === selectedUserId.toString()) {
                  return {
                    ...contact,
                    lastMessage:
                      messageData.message || `Sent a ${selectedFile.type.startsWith("image/") ? "photo" : "file"}`, // Update last message for contact
                    lastMessageTimestamp: messageData.timestamp,
                  }
                }
                return contact
              })
            })
          }
          setMessage("")
          setSelectedFile(null) // Clear selected file
          if (fileInputRef.current) {
            fileInputRef.current.value = "" // Clear file input
          }
        }
        reader.readAsDataURL(selectedFile)
      } else {
        // Existing text message logic
        const messageData: Message = {
          // Ensure type safety
          message: message.trim(),
          timestamp: Date.now(),
          userId: currentUser?.id ? currentUser.id.toString() : undefined,
          username: currentUser?.name || undefined,
          senderId: currentUser?.id ? currentUser.id.toString() : undefined,
          receiverId: selectedUserId ? selectedUserId.toString() : undefined,
        }
        console.log("[SEND PAYLOAD]", messageData)
        socket.emit("message", messageData)
        setMessages((prev) => [...prev, messageData])
        setTimeout(scrollToBottom, 0)
        if (selectedUserId) {
          saveReadStatus(selectedUserId)
        }
        if (selectedUserId) {
          setContactMessages((prev) => {
            const existingMessages = prev[selectedUserId.toString()] || []
            return {
              ...prev,
              [selectedUserId.toString()]: [...existingMessages, messageData],
            }
          })
          setContacts((prevContacts) => {
            return prevContacts.map((contact) => {
              if (contact.id.toString() === selectedUserId.toString()) {
                return {
                  ...contact,
                  lastMessage: messageData.message,
                  lastMessageTimestamp: messageData.timestamp,
                }
              }
              return contact
            })
          })
        }
        setMessage("")
      }
    }
  }

  useEffect(() => {
    if (currentUser?.id && selectedUserId) {
      // Fetch messages for the conversation between current user and selected user
      console.log(`Fetching chat history between users ${currentUser.id} and ${selectedUserId}`)
      // First check if we already have messages in contactMessages
      const existingMessages = contactMessages[selectedUserId.toString()]
      if (existingMessages && existingMessages.length > 0) {
        // Use cached messages to prevent flickering
        setMessages(existingMessages)
        // Immediately scroll to bottom when changing users
        setTimeout(scrollToBottom, 0)
      }
      // Always fetch fresh data from the server
      fetchChatHistory(currentUser.id.toString(), selectedUserId.toString()).then(() => {
        // Scroll to bottom after fetching new messages
        setTimeout(scrollToBottom, 0)
      })
    }
  }, [selectedUserId, currentUser?.id])

  return (
    <div className={`flex h-screen ${themeClasses} transition-colors duration-200`}>
      {/* Sidebar */}
      <aside className={`w-80 ${sidebarClasses} border-r flex flex-col`}>
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-6 h-6" style={{ color: "#006699" }} />
              <span style={{ color: "#006699" }}>Messages</span>
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              style={{ color: "#006699" }}
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
                borderColor: "#eaeaea",
                background: "#fff",
                color: colors.primary.hex,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto border-t border-[#eaeaea]">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id || contact.name}
              onClick={() => {
                setSelectedUser(contact.name)
                setSelectedUserId(contact.id)
                // Save this contact as read in localStorage
                saveReadStatus(contact.id)
                // Reset unread when selecting a contact
                setContacts((prevContacts) => prevContacts.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c)))
              }}
              className={`py-4 px-6 cursor-pointer transition-all duration-200 border-b hover:bg-blue-50 ${
                selectedUser === contact.name ? `bg-blue-50 border-l-4 shadow-sm` : ""
              }`}
              style={{
                borderColor: "#eaeaea",
                borderLeftColor: selectedUser === contact.name ? "#006699" : "transparent",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                      selectedUser === contact.name ? "ring-2 ring-offset-2 ring-blue-500" : ""
                    }`}
                    style={{
                      backgroundColor: selectedUser === contact.name ? "#004d73" : "#006699",
                      color: "white",
                      boxShadow: selectedUser === contact.name ? "0 0 0 2px rgba(0, 102, 153, 0.3)" : "none",
                    }}
                  >
                    {contact.name?.[0]?.toUpperCase() || "?"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`${selectedUser === contact.name ? "font-semibold" : "font-medium"} text-[15px]`}
                      style={{
                        color: selectedUser === contact.name ? "#004d73" : "#006699",
                      }}
                    >
                      {contact.name}
                    </h3>
                    {contact.lastMessageTimestamp && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(new Date(contact.lastMessageTimestamp))}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm truncate mt-1"
                    style={{
                      fontWeight: contact.unread > 0 ? "medium" : "normal",
                      color: selectedUser === contact.name ? "#333333" : "#666666",
                    }}
                  >
                    {contact.lastMessage ? (
                      <>
                        {contact.lastMessageTimestamp && getUserNameById(contact.id.toString()) !== selectedUser ? (
                          <span className="font-medium mr-1">You:</span>
                        ) : null}
                        {contact.lastMessage}
                      </>
                    ) : (
                      "No messages yet"
                    )}
                  </p>
                  {contact.unread > 0 && (
                    <div className="mt-1">
                      <span className="bg-blue-950 text-white  text-xs rounded-full px-2 py-0.5 text-right">
                        {contact.unread}
                      </span>
                    </div>
                  )}
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
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: colors.primary.hex }}>
                  {selectedUser}
                </h2>
              </div>
            </div>
          </div>
        </header>
        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse"
          style={{ background: colors.accent.hex + "11" }}
        >
          <div ref={messagesEndRef} />
          {messages
            .slice()
            .reverse()
            .map((msg, i) => {
              const isSentByMe = msg.senderId === (currentUser?.id ? currentUser.id.toString() : undefined)
              let senderName = ""
              if (!isSentByMe && msg.senderId) {
                const contact = contacts.find((c) => c.id.toString() === msg.senderId)
                senderName = contact?.name || msg.username || `User ${msg.senderId}`
              }
              return (
                <div key={i} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${!isSentByMe ? "order-2" : ""}`}>
                    {/* Show sender name and ID for received messages */}
                    {!isSentByMe && (
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                          }}
                        >
                          {senderName[0] || "?"}
                        </div>
                        <span className="text-xs" style={{ color: colors.secondary.hex }}>
                          {senderName}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${isSentByMe ? "bg-blue-100" : "bg-white"} text-gray-900 rounded-bl-sm border ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"}`}
                      style={{ borderColor: colors.primary.hex }}
                    >
                      {msg.fileUrl && msg.fileType?.startsWith("image/") ? (
                        // Render image
                        <img
                          src={msg.fileUrl || "/placeholder.svg"}
                          alt="Attached image"
                          className="max-w-full h-auto rounded-lg mb-2"
                        />
                      ) : msg.fileUrl ? (
                        // Render other file types as a link
                        <div className="flex items-center gap-2 mb-2">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <a
                            href={msg.fileUrl}
                            download={`file.${msg.fileType?.split("/")[1] || "bin"}`}
                            className="text-blue-600 hover:underline"
                          >
                            {msg.fileType || "Attached File"}
                          </a>
                        </div>
                      ) : null}
                      {msg.message && <p>{msg.message}</p>} {/* Only render message if it exists */}
                      {msg.timestamp && (
                        <p className="text-xs text-right mt-1 text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
        {/* Chat Input */}
        <div className="p-4 bg-white border-t" style={{ borderColor: colors.primary.hex }}>
          <div className="flex items-end gap-3">
            {/* File input button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" // Hide the default file input
            />
            <button
              onClick={() => fileInputRef.current?.click()} // Trigger file input click
              className="p-3 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                color: "#fff",
              }}
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1">
              {selectedFile && (
                <div className="mb-2 p-2 border rounded-lg flex items-center justify-between bg-gray-50">
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
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
              disabled={!message.trim() && !selectedFile} // Disable if both message and file are empty
              className="p-3 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                color: "#fff",
                opacity: !message.trim() && !selectedFile ? 0.5 : 1,
                cursor: !message.trim() && !selectedFile ? "not-allowed" : "pointer",
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
      {/* Audio element for notifications */}
      <audio ref={audioRef} src="/audio/tune.mp3" preload="auto" />
    </div>
  )
}
