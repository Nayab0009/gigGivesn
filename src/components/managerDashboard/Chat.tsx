"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, MessageCircle, Search, Paperclip, Video, Trash2, Loader2 } from "lucide-react"
import { colors } from "@/colors" // Assuming this file exists and exports colors
import { ShowEmployee } from "@/lib/TeamService" // Assuming this service exists
import { useAuth } from "@/context/AuthContext" // Assuming this context exists
import { initiateSocket, getSocket } from "@/lib/socket" // Assuming these socket functions exist
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService" // Use the chatService sendMessage for fetching history
import { deletemessage, uploadfile } from "@/lib/chatService"
// Removed: import { toast } from "@/hooks/use-toast";
// Removed: import { v4 as uuidv4 } from "uuid";
export default function ChatPage() {
  type Message = {
    id?: string
    message: string // This will be the text message or an empty string for files
    timestamp?: number
    userId?: string
    username?: string
    senderId?: string
    receiverId?: string
    fileUrl?: string // This will hold the URL for files
    fileType?: string // This will hold the inferred file type
    isFile?: boolean // New field to indicate if it's a file message
    isPending?: boolean // New field for optimistic updates/loading state
  }
  type EnhancedContact = {
    id: string | number
    name: string
    avatar?: string
    status?: string
    lastMessage?: string
    lastMessageTimestamp?: number
    lastMessageSenderId?: string // New field to store the sender of the last message
    unread: number
  }
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // New state for selected file
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref for file input
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | number>("")
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
  const [generatedLink, setGeneratedLink] = useState("")
  const [showMeetingDialog, setShowMeetingDialog] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null)
  const [messageSearchQuery, setMessageSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
   const [activeTab, setActiveTab] = useState<"pictures" | "files">("files")
  // New state for full screen image
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
  // Helper to infer file type from URL extension
  const getFileTypeFromUrl = (url: string): string | undefined => {
    if (!url) return undefined
    const parts = url.split(".")
    const extension = parts[parts.length - 1]?.toLowerCase()
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "webp":
        return `image/${extension}`
      case "pdf":
        return "application/pdf"
      case "doc":
      case "docx":
        return "application/msword"
      case "xls":
      case "xlsx":
        return "application/vnd.ms-excel"
      case "txt":
      case "csv":
        return "text/plain"
      // Add more as needed
      default:
        return undefined // Or 'application/octet-stream' for generic binary
    }
  }
  // Custom ID generation function (replaces uuidv4)
  const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15)
  }
  // Generate a unique room ID and link for the call
  const generateRoom = async () => {
    const roomId = generateUniqueId()
    const link = `${window.location.origin}/call?roomId=${roomId}`
    setGeneratedLink(link)

    // Create the message data
    const meetingMessage = `Join the meeting: ${link}`

    // Send the message automatically
    const socket = getSocket()
    if (socket && selectedUserId) {
      const msgData = {
        message: meetingMessage,
        timestamp: Date.now(),
        userId: currentUser?.id?.toString(),
        username: currentUser?.name,
        senderId: currentUser?.id?.toString(),
        receiverId: selectedUserId?.toString(),
        isFile: false,
        isPending: false,
      }

      // Emit to socket
      socket.emit("message", msgData)

      // Update local state
      setMessages((prev) => [...prev, msgData])
      setTimeout(scrollToBottom, 0)

      // Save read status and update contacts
      saveReadStatus(selectedUserId)
      setContactMessages((prev) => {
        const existing = prev[selectedUserId.toString()] || []
        return {
          ...prev,
          [selectedUserId.toString()]: [...existing, msgData],
        }
      })

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id.toString() === selectedUserId.toString()
            ? {
                ...contact,
                lastMessage: msgData.message,
                lastMessageTimestamp: msgData.timestamp,
                lastMessageSenderId: currentUser?.id?.toString(),
              }
            : contact,
        ),
      )
    }

    return link
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
      ? `bg-[${colors.white.hex}] border-[${colors.white.hex}]`
      : `bg-white border-[${colors.primary.hex}]`
  const fetchChatHistory = async (senderId: string, receiverId: string) => {
    try {
      const data = await fetchChatHistoryAPI(senderId, receiverId)
      const messagesArray = Array.isArray(data) ? data : data.messages || []
      const mappedMessages = messagesArray.map((msg: any) => {
        const isFileFromMessageBody = typeof msg.messageBody === "string" && msg.messageBody.startsWith("http")
        return {
          id: msg.id,
          message: isFileFromMessageBody ? "" : msg.messageBody || "",
          senderId: msg.sendBy?.id?.toString(),
          receiverId: msg.receivedBy?.id?.toString(),
          username: msg.sendBy?.name,
          timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : undefined,
          fileUrl: isFileFromMessageBody ? msg.messageBody : undefined,
          fileType: isFileFromMessageBody ? getFileTypeFromUrl(msg.messageBody) : undefined,
          isFile: isFileFromMessageBody,
          isPending: false, // Ensure fetched messages are not pending
        }
      })
      setMessages(mappedMessages)
      if (mappedMessages.length > 0) {
        setContactMessages((prev) => ({
          ...prev,
          [selectedUserId.toString()]: mappedMessages,
        }))
        const lastMessage = mappedMessages[mappedMessages.length - 1]
        if (lastMessage) {
          saveReadStatus(selectedUserId)
          setContacts((prevContacts) => {
            return prevContacts.map((contact) => {
              if (contact.id.toString() === selectedUserId.toString()) {
                const messageContent =
                  lastMessage.message ||
                  (lastMessage.isFile
                    ? lastMessage.senderId === currentUser?.id?.toString()
                      ? `You: Sent a ${lastMessage.fileType?.startsWith("image/") ? "photo" : "file"}`
                      : `Received a ${lastMessage.fileType?.startsWith("image/") ? "photo" : "file"}`
                    : "New message")
                return {
                  ...contact,
                  lastMessage: messageContent,
                  lastMessageTimestamp: lastMessage.timestamp,
                  lastMessageSenderId: lastMessage.senderId, // Store sender ID
                  unread: 0,
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
  const fetchLatestMessage = async (userId: string, contactId: string) => {
    try {
      const data = await fetchChatHistoryAPI(userId, contactId)
      const messagesArray = Array.isArray(data) ? data : data.messages || []
      if (messagesArray.length > 0) {
        const latestMsg = messagesArray[messagesArray.length - 1]
        const isFile =
          latestMsg.isFile || (typeof latestMsg.messageBody === "string" && latestMsg.messageBody.startsWith("http"))
        return {
          message: isFile ? "" : latestMsg.messageBody,
          senderId: latestMsg.sendBy?.id?.toString(),
          timestamp: latestMsg.createdAt ? new Date(latestMsg.createdAt).getTime() : Date.now(),
          fileUrl: isFile ? latestMsg.messageBody : undefined,
          fileType: isFile ? getFileTypeFromUrl(latestMsg.messageBody) : undefined,
          isFile: isFile,
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching latest message:", error)
      return null
    }
  }
  useEffect(() => {
    const fetchContactsAndLastMessages = async () => {
      try {
        let response
        if (currentRole === "manager") {
          response = await ShowEmployee("employee")
        } else if (currentRole === "employee") {
          response = await ShowEmployee("manager")
        }

        // Fix: Handle the nested array structure
        let contactsData = []
        if (Array.isArray(response)) {
          // If response is the nested array directly [[...], 1]
          contactsData = Array.isArray(response[0]) ? response[0] : response
        } else if (response?.data) {
          // If response has a data property
          contactsData = Array.isArray(response.data[0]) ? response.data[0] : response.data
        } else {
          contactsData = []
        }

        const basicContacts = contactsData.map((contact: any) => ({
          ...contact,
          lastMessage: "",
          lastMessageTimestamp: undefined,
          lastMessageSenderId: undefined,
          unread: 0,
        }))

        setContacts(basicContacts)

        if (currentUser?.id) {
          const userId = currentUser.id.toString()
          const updatedContacts = [...basicContacts]
          const readStatus = loadReadStatus()
          const lastSelectedIdFromStorage = localStorage.getItem("lastSelectedUserId")

          const messagePromises = basicContacts.map(async (contact: EnhancedContact, index: number) => {
            const latestMessage = await fetchLatestMessage(userId, contact.id.toString())
            if (latestMessage) {
              const isRead = readStatus[contact.id.toString()] === true
              const messageContent =
                latestMessage.message ||
                (latestMessage.isFile
                  ? latestMessage.senderId === userId
                    ? `You: Sent a ${latestMessage.fileType?.startsWith("image/") ? "photo" : "file"}`
                    : `Received a ${latestMessage.fileType?.startsWith("image/") ? "photo" : "file"}`
                  : "New message")

              updatedContacts[index] = {
                ...updatedContacts[index],
                lastMessage: messageContent,
                lastMessageTimestamp: latestMessage.timestamp,
                lastMessageSenderId: latestMessage.senderId,
                unread: latestMessage.senderId !== userId && !isRead ? 1 : 0,
              }
            }
            return null
          })

          await Promise.all(messagePromises)
          setContacts(updatedContacts)

          // Initialize selectedUser and selectedUserId
          if (lastSelectedIdFromStorage) {
            const foundContact = updatedContacts.find((c) => c.id.toString() === lastSelectedIdFromStorage)
            if (foundContact) {
              setSelectedUser(foundContact.name)
              setSelectedUserId(foundContact.id)
              saveReadStatus(foundContact.id)
            } else if (updatedContacts.length > 0) {
              setSelectedUser(updatedContacts[0].name)
              setSelectedUserId(updatedContacts[0].id)
              saveReadStatus(updatedContacts[0].id)
            }
          } else if (updatedContacts.length > 0) {
            setSelectedUser(updatedContacts[0].name)
            setSelectedUserId(updatedContacts[0].id)
            saveReadStatus(updatedContacts[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error)
        setContacts([])
      }
    }

    if (currentRole && currentUser?.id) fetchContactsAndLastMessages()
  }, [currentRole, currentUser?.id])
  useEffect(() => {
    if (selectedUserId) {
      localStorage.setItem("lastSelectedUserId", selectedUserId.toString())
    }
  }, [selectedUserId])
  useEffect(() => {
    scrollToBottom()
  }, [messages])
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
      console.log("[RAW RECEIVED PAYLOAD]", data)
      setMessageCounter((prev) => prev + 1)
      if (data && typeof data === "object") {
        const currentUserId = currentUser?.id?.toString()
        const isFileMessage = typeof data.message === "string" && data.message.startsWith("http")
        console.log("🔍 File detection (based on raw message content):", {
          message: data.message,
          isFileMessage: isFileMessage,
        })
        const mappedData: Message = {
          id: data.id,
          message: isFileMessage ? "" : data.message || "",
          timestamp: data.createdAt ? new Date(data.createdAt).getTime() : data.timestamp || Date.now(),
          userId: data.userId,
          username: data.username,
          senderId: data.sendBy?.id?.toString() || data.senderId?.toString(),
          receiverId: data.receivedBy?.id?.toString() || data.receiverId?.toString(),
          fileUrl: isFileMessage ? data.message : undefined,
          fileType: isFileMessage ? getFileTypeFromUrl(data.message) : undefined,
          isFile: isFileMessage,
          isPending: false,
        }
        console.log("📝 Mapped message data (frontend internal state):", mappedData)
        if (mappedData.senderId === currentUserId || mappedData.receiverId === currentUserId) {
          const contactId = mappedData.senderId === currentUserId ? mappedData.receiverId : mappedData.senderId
          if (notifications && mappedData.senderId !== currentUserId && audioRef.current) {
            audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
          }
          setContactMessages((prev) => {
            const existingMessages = prev[contactId?.toString() ?? ""] || []
            return {
              ...prev,
              [contactId?.toString() ?? ""]: [...existingMessages, mappedData],
            }
          })
          setContacts((prevContacts) => {
            return prevContacts.map((contact) => {
              if (contact.id.toString() === contactId) {
                const isUnread =
                  mappedData.senderId !== currentUserId && contact.id.toString() !== selectedUserId.toString()
                if (contact.id.toString() === selectedUserId.toString()) {
                  saveReadStatus(contact.id)
                }
                const messageContent =
                  mappedData.message ||
                  (mappedData.isFile
                    ? mappedData.senderId === currentUserId
                      ? `You: Sent a ${mappedData.fileType?.startsWith("image/") ? "photo" : "file"}`
                      : `Received a ${mappedData.fileType?.startsWith("image/") ? "photo" : "file"}`
                    : "New message")
                return {
                  ...contact,
                  lastMessage: messageContent,
                  lastMessageTimestamp: mappedData.timestamp,
                  lastMessageSenderId: mappedData.senderId, // Store sender ID for new messages
                  unread: isUnread ? (contact.unread || 0) + 1 : contact.unread,
                }
              }
              return contact
            })
          })
          // This is the crucial check for real-time display in the active chat
          if (
            mappedData.senderId === selectedUserId.toString() ||
            mappedData.receiverId === selectedUserId.toString()
          ) {
            console.log(`✅ Message #${messageCounter} accepted for current chat:`, {
              currentUserId,
              senderId: mappedData.senderId,
              receiverId: mappedData.receiverId,
              selectedUserId: selectedUserId.toString(),
            })
            setMessages((prev) => [...prev, mappedData])
            setContacts((prevContacts) => {
              return prevContacts.map((contact) => {
                if (contact.id.toString() === selectedUserId.toString()) {
                  saveReadStatus(contact.id)
                  return { ...contact, unread: 0 }
                }
                return contact
              })
            })
          } else {
            console.log(`⚠️ Message #${messageCounter} filtered out (not for selected chat):`, {
              currentUserId,
              senderId: mappedData.senderId,
              receiverId: mappedData.receiverId,
              selectedUserId: selectedUserId.toString(),
            })
          }
        } else {
          console.log(`❌ Message #${messageCounter} filtered out (not for current user):`, {
            currentUserId,
            senderId: mappedData.senderId,
            receiverId: mappedData.receiverId,
          })
        }
      }
    }
    socket.on("message", handleMessage)
    return () => {
      socket.off("message", handleMessage)
    }
  }, [selectedUserId, currentUser, notifications, messageCounter]) // Added selectedUserId to dependencies
  const sendMessage = async () => {
    const socket = getSocket()
    if (!socket || (!message.trim() && !selectedFile)) return
    if (isUploadingFile) return // Prevent sending if a file is already uploading
    const tempMessageId = generateUniqueId() // Using custom ID generation for pending message
    if (selectedFile) {
      setIsUploadingFile(true) // Start uploading indicator
      // Optimistically add a pending message to the UI
      const pendingMsgData: Message = {
        id: tempMessageId,
        message: message.trim(),
        timestamp: Date.now(),
        userId: currentUser?.id?.toString(),
        username: currentUser?.name,
        senderId: currentUser?.id?.toString(),
        receiverId: selectedUserId?.toString(),
        fileUrl: URL.createObjectURL(selectedFile), // Use local URL for immediate preview
        fileType: selectedFile?.type,
        isFile: true,
        isPending: true, // Mark as pending
      }
      setMessages((prev) => [...prev, pendingMsgData])
      setTimeout(scrollToBottom, 0)
      try {
        const uploadResult = await uploadfile(
          selectedFile,
          message.trim(),
          currentUser?.id?.toString(),
          selectedUserId?.toString(),
        )
        // Update the pending message with actual data and remove pending status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  ...msg,
                  id: uploadResult.id, // Use actual message ID from backend
                  fileUrl: uploadResult.messageBody, // Use actual file URL from backend
                  isPending: false,
                }
              : msg,
          ),
        )
        const socketEmitData = {
          message: uploadResult.messageBody,
          senderId: currentUser?.id?.toString(),
          receiverId: selectedUserId?.toString(),
        }
        console.log("🚀 Emitting file message to socket (minimal payload):", socketEmitData)
        socket.emit("message", socketEmitData)
        if (selectedUserId) saveReadStatus(selectedUserId)
        setContactMessages((prev) => {
          const existing = prev[selectedUserId.toString()] || []
          return {
            ...prev,
            [selectedUserId.toString()]: [
              ...existing.filter((m) => m.id !== tempMessageId),
              { ...pendingMsgData, id: uploadResult.id, fileUrl: uploadResult.messageBody, isPending: false },
            ],
          }
        })
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id.toString() === selectedUserId.toString()
              ? {
                  ...contact,
                  lastMessage:
                    pendingMsgData.message ||
                    `You: Sent a ${pendingMsgData.fileType?.startsWith("image/") ? "photo" : "file"}`,
                  lastMessageTimestamp: pendingMsgData.timestamp,
                  lastMessageSenderId: currentUser?.id?.toString(), // Store current user as sender
                }
              : contact,
          ),
        )
        setMessage("")
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      } catch (error) {
        alert("File upload failed. Please try again.")
        console.error("File upload error:", error)
        // Remove the pending message if upload fails
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId))
      } finally {
        setIsUploadingFile(false) // End uploading indicator
      }
    } else {
      // Send plain text message
      const msgData = {
        message: message.trim(),
        timestamp: Date.now(),
        userId: currentUser?.id?.toString(),
        username: currentUser?.name,
        senderId: currentUser?.id?.toString(),
        receiverId: selectedUserId?.toString(),
        isFile: false,
        isPending: false,
      }
      console.log("🚀 Emitting text message to socket:", msgData)
      socket.emit("message", msgData)
      setMessages((prev) => [...prev, msgData])
      setTimeout(scrollToBottom, 0)
      if (selectedUserId) saveReadStatus(selectedUserId)
      setContactMessages((prev) => {
        const existing = prev[selectedUserId.toString()] || []
        return {
          ...prev,
          [selectedUserId.toString()]: [...existing, msgData],
        }
      })
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id.toString() === selectedUserId.toString()
            ? {
                ...contact,
                lastMessage: msgData.message,
                lastMessageTimestamp: msgData.timestamp,
                lastMessageSenderId: currentUser?.id?.toString(), // Store current user as sender
              }
            : contact,
        ),
      )
      setMessage("")
    }
  }
  useEffect(() => {
    if (currentUser?.id && selectedUserId) {
      console.log(`Fetching chat history between users ${currentUser.id} and ${selectedUserId}`)
      const existingMessages = contactMessages[selectedUserId.toString()]
      if (existingMessages && existingMessages.length > 0) {
        setMessages(existingMessages)
        setTimeout(scrollToBottom, 0)
      }
      fetchChatHistory(currentUser.id.toString(), selectedUserId.toString()).then(() => {
        setTimeout(scrollToBottom, 0)
      })
    } else {
      // Clear messages when no user is selected
      setMessages([])
    }
  }, [selectedUserId, currentUser?.id])
  const handleDeleteMessage = async (id: string | undefined) => {
    if (!id) return
    try {
      await deletemessage(id)
      // Update messages in the main chat view
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
      // Update messages in the contactMessages cache and then update contacts state
      setContactMessages((prev) => {
        const updatedContactMessages = { ...prev }
        const currentContactMessages = updatedContactMessages[selectedUserId.toString()] || []
        const filteredMessages = currentContactMessages.filter((msg) => msg.id !== id)
        updatedContactMessages[selectedUserId.toString()] = filteredMessages
        // Determine the new last message for the selected contact
        const newLastMessage = filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1] : null
        // Update the contacts state based on the new last message
        setContacts((prevContacts) =>
          prevContacts.map((contact) => {
            if (contact.id.toString() === selectedUserId.toString()) {
              if (newLastMessage) {
                const messageContent =
                  newLastMessage.message ||
                  (newLastMessage.isFile
                    ? newLastMessage.senderId === currentUser?.id?.toString()
                      ? `You: Sent a ${newLastMessage.fileType?.startsWith("image/") ? "photo" : "file"}`
                      : `Received a ${newLastMessage.fileType?.startsWith("image/") ? "photo" : "file"}`
                    : "New message") // Fallback if message is empty and not a file
                return {
                  ...contact,
                  lastMessage: messageContent,
                  lastMessageTimestamp: newLastMessage.timestamp,
                  lastMessageSenderId: newLastMessage.senderId,
                  unread: 0, // Assuming deleting a message means it's read
                }
              } else {
                // No messages left for this contact
                return {
                  ...contact,
                  lastMessage: "",
                  lastMessageTimestamp: undefined,
                  lastMessageSenderId: undefined,
                  unread: 0,
                }
              }
            }
            return contact
          }),
        )
        return updatedContactMessages
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      // Optionally, show an error message to the user
    }
  }

  // Helper function to render message content with clickable links and search highlighting
  const renderMessageContent = (text: string, searchQuery: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        )
      }
      // Highlight search query
      const highlightedPart = searchQuery
        ? part.split(new RegExp(`(${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"))
        : [part]
      return (
        <span key={index}>
          {highlightedPart.map((segment, segIndex) =>
            searchQuery && segment.toLowerCase() === searchQuery.toLowerCase() ? (
              <mark key={segIndex} className="bg-yellow-300 text-black">
                {segment}
              </mark>
            ) : (
              segment
            ),
          )}
        </span>
      )
    })
  }
  const searchMessages = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearchActive(false)
      setCurrentSearchIndex(0)
      return
    }

    const filteredMessages = messages.filter(
      (msg) =>
        msg.message.toLowerCase().includes(query.toLowerCase()) ||
        (msg.username && msg.username.toLowerCase().includes(query.toLowerCase())),
    )

    setSearchResults(filteredMessages)
    setIsSearchActive(true)
    setCurrentSearchIndex(0)
  }
  const navigateSearchResults = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return

    if (direction === "next") {
      setCurrentSearchIndex((prev) => (prev >= searchResults.length - 1 ? 0 : prev + 1))
    } else {
      setCurrentSearchIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1))
    }
  }
  return (
    <div className="flex h-screen  rounded-3xl p-4 gap-10">
      {/* Sidebar */}
      {/* Sidebar - Replace from line 473 */}
      <aside className=" top-[226px] left-[30px]  w-80 bg-black/30  rounded-xl     pr-[1px] border border-[#FFFFFF33] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      {/* Current User Avatar */}
      {currentUser?.avatar ? (
        <img
          src={currentUser.avatar}
          alt={currentUser.name || "User"}
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
          }}
        >
          {currentUser?.name?.[0]?.toUpperCase() || "?"}
        </div>
      )}

      {/* Chat Title */}
      <h1 className="text-xl font-bold flex items-center gap-2 text-white">

        <span>Chat</span>
      </h1>
    </div>
  </div>

  {/* Modern search bar */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 z-10" />
    <input
      type="text"
      placeholder="Search"
      className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black/30 backdrop-blur-sm  text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
</div>
        {/* Contact list with modern cards */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Team section */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-white/70 mb-3">Team</h3>
            <div className="space-y-2">
              {filteredContacts.slice(0, Math.ceil(filteredContacts.length / 2)).map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedUser(contact.name)
                    setSelectedUserId(contact.id)
                    saveReadStatus(contact.id)
                    setContacts((prevContacts) =>
                      prevContacts.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c)),
                    )
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-black/30 ${
                    selectedUser === contact.name ? "bg-black/30 " : ""
                  }`}
                >
                  <div className="relative">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar || "/placeholder.svg"}
                        alt={contact.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{
                          background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                        }}
                      >
                        {contact.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-white/20"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{contact.name}</p>
                    <p className="text-white/60 text-xs truncate">
                      {contact.lastMessage ? (
                        <>
                          {contact.lastMessageSenderId === currentUser?.id?.toString() &&
                          !contact.lastMessage?.startsWith("You:") ? (
                            <span className="font-medium mr-1">You:</span>
                          ) : null}
                          {contact.lastMessage}
                        </>
                      ) : (
                        "No messages yet"
                      )}
                    </p>
                  </div>
                  {contact.unread > 0 && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Personal section */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-white/70 mb-3">Personal</h3>
            <div className="space-y-2">
              {filteredContacts.slice(Math.ceil(filteredContacts.length / 2)).map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedUser(contact.name)
                    setSelectedUserId(contact.id)
                    saveReadStatus(contact.id)
                    setContacts((prevContacts) =>
                      prevContacts.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c)),
                    )
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/10 ${
                    selectedUser === contact.name ? "bg-white/15 border border-white/20" : ""
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                      }}
                    >
                      {contact.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-white/20"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{contact.name}</p>
                    <p className="text-white/60 text-xs truncate">
                      {contact.lastMessage ? (
                        <>
                          {contact.lastMessageSenderId === currentUser?.id?.toString() &&
                          !contact.lastMessage?.startsWith("You:") ? (
                            <span className="font-medium mr-1">You:</span>
                          ) : null}
                          {contact.lastMessage}
                        </>
                      ) : (
                        "No messages yet"
                      )}
                    </p>
                  </div>
                  {contact.unread > 0 && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
      {/* Main Chat Area - Conditional Rendering */}
      {selectedUserId ? (
        <main
          className="flex flex-col flex-1  rounded-[20px]
    border border-[#FFFFFF33]"
        >
          {/* Chat
           */}
          <header
            className={`
    bg-black/30
    rounded-t-[20px]
    border-b border-b-[#FFFFFF33]
    pt-[24px] pr-[24px] pb-[25px] pl-[24px]
  `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {contacts.find((c) => c.id === selectedUserId)?.avatar ? (
                    <img
                      src={contacts.find((c) => c.id === selectedUserId)?.avatar || "/placeholder.svg"}
                      alt={selectedUser}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                      }}
                    >
                      {selectedUser[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedUser}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md">
                {/* Search Icon */}
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0000004D] cursor-pointer"
                  onClick={() => setIsSearchActive(!isSearchActive)}
                >
                  <Search className="w-5 h-5 text-white" />
                </div>
                {isSearchActive && (
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      className="w-48 pl-4 pr-16 py-2 rounded-2xl bg-black/30 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                      value={messageSearchQuery}
                      onChange={(e) => {
                        setMessageSearchQuery(e.target.value)
                        searchMessages(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          searchMessages(messageSearchQuery)
                        }
                      }}
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute right-2 flex items-center gap-1">
                        <span className="text-white text-sm">
                          {currentSearchIndex + 1}/{searchResults.length}
                        </span>
                        <button
                          onClick={() => navigateSearchResults("prev")}
                          className="p-1 rounded-full hover:bg-white/20 text-white"
                          aria-label="Previous search result"
                        >
                          {"<"}
                        </button>
                        <button
                          onClick={() => navigateSearchResults("next")}
                          className="p-1 rounded-full hover:bg-white/20 text-white"
                          aria-label="Next search result"
                        >
                          {">"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {/* End CHANGE */}

                {/* Video Button */}
                <button
                  onClick={() => setShowMeetingDialog(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0000004D] hover:bg-white/20 transition"
                  aria-label="Start meeting"
                  type="button"
                >
                  <Video className="w-6 h-6 text-white" />
                </button>
                {/* User Button */}
                <button
                  onClick={() => setShowUserProfile(!showUserProfile)}
                  className="p-2 rounded-full hover:bg-white/10 transition"
                  aria-label="Toggle user profile"
                  type="button"
                >
                  {contacts.find((c) => c.id === selectedUserId)?.avatar ? (
                    <img
                      src={contacts.find((c) => c.id === selectedUserId)?.avatar || "/placeholder.svg"}
                      alt={selectedUser}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                      }}
                    >
                      {selectedUser[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
              </div>

              {/* Meeting Dialog */}
              {typeof window !== "undefined" && (
                <>
                  {showMeetingDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      {/* Blurred backdrop overlay */}
                      <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-md"
                        onClick={() => setShowMeetingDialog(false)}
                      ></div>

                      {/* Modal content */}
                      <div className="relative bg-black/30 rounded-2xl shadow-2xl p-8 w-96 border border-white/20">
                        <div className="text-center">
                          {/* Video call icon */}
                          <div
                            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                            }}
                          >
                            <Video className="w-8 h-8 text-white" />
                          </div>

                          <h3 className="text-xl font-semibold mb-2 text-white">Start Video Call</h3>
                          <p className="text-white/70 text-sm mb-8">Ready to start a meeting with {selectedUser}?</p>

                          {/* Action buttons */}
                          <div className="space-y-3">
                            <button
                              className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200 hover:scale-105"
                              style={{
                                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                              }}
                              onClick={async () => {
                                const link = await generateRoom()
                                console.log("Generated meeting link:", link)
                                if (link) {
                                  window.open(link, "_blank")
                                }
                                setShowMeetingDialog(false)
                              }}
                            >
                              Start Meeting
                            </button>

                            <button
                              className="w-full py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                              onClick={() => setShowMeetingDialog(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </header>
          {/* Messages Area */}
          <div className="px-4 py-2 space-y-4 flex flex-col-reverse flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-black/30  ">
            <div ref={messagesEndRef} />
            {/* Conditionally render messages based on search results */}
            {(isSearchActive ? searchResults : messages)
              .slice()
              .reverse()
              .map((msg, i) => {
                const isSentByMe = msg.senderId === (currentUser?.id ? currentUser.id.toString() : undefined)
                let senderName = ""
                if (!isSentByMe && msg.senderId) {
                  const contact = contacts.find((c) => c.id.toString() === msg.senderId)
                  senderName = contact?.name || msg.username || `User ${msg.senderId}`
                }

                const isCurrentSearchResult =
                  isSearchActive && searchResults.length > 0 && searchResults[currentSearchIndex]?.id === msg.id

                return (
                  <div key={i} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md ${!isSentByMe ? "order-2" : ""} ${isCurrentSearchResult ? "ring-2 ring-yellow-500 rounded-xl" : ""}`}
                    >
                      {/* Show sender name and ID for received messages */}
                      {!isSentByMe && (
                        <div className="flex items-center gap-2 mb-1">
                          {(() => {
                            const contact = contacts.find((c) => c.id.toString() === msg.senderId)
                            return contact?.avatar ? (
                              <img
                                src={contact.avatar || "/placeholder.svg"}
                                alt={senderName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                }}
                              >
                                {senderName[0] || "?"}
                              </div>
                            )
                          })()}
                          <span className="text-xs" style={{ color: colors.secondary.hex }}>
                            {senderName}
                          </span>
                        </div>
                      )}
                      <div
                        className={`
    pt-[8px] pr-[16px] pb-[8px] pl-[16px]
    rounded-tl-[12px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[24px]
    shadow-sm
    ${isSentByMe ? "text-white border" : "bg-[#1F293799] backdrop-blur-sm text-white border border-[#FFFFFF33]"}
    ${fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base"}
  `}
                        style={
                          isSentByMe
                            ? {
                                background: `linear-gradient(135deg, ${colors.primary.hex}, #006496)`,
                                borderColor: colors.primary.hex,
                              }
                            : {}
                        }
                      >
                        {msg.fileUrl && msg.fileType?.startsWith("image/") ? (
                          // Render image
                          <img
                            src={msg.fileUrl || "/placeholder.svg"}
                            alt="Attached image"
                            className="max-w-[200px] max-h-[200px] object-cover rounded-lg mb-2 cursor-pointer"
                            onClick={() => setFullScreenImageUrl(msg.fileUrl || "/placeholder.svg")} // Added click handler
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
                        {msg.message && <p>{renderMessageContent(msg.message, messageSearchQuery)}</p>}
                        {msg.isPending && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            <span>Uploading...</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          {msg.timestamp && (
                            <p className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="ml-2 p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors"
                            aria-label="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
          {/* Chat Input */}

          <div className="p-4 bg-black/30    border-t border-t-[#FFFFFF33]   rounded-b-[20px]     pt-[25px] pr-[24px] pb-[24px] pl-[24px]">
            <div className="flex items-center justify-between gap-3">
              {/* File input button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" // Hide the default file input
                disabled={isUploadingFile} // Disable during upload
              />
              <button
                onClick={() => fileInputRef.current?.click()} // Trigger file input click
                className="p-3 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: "#fff",
                  opacity: isUploadingFile ? 0.5 : 1,
                  cursor: isUploadingFile ? "not-allowed" : "pointer",
                }}
                aria-label="Attach file"
                disabled={isUploadingFile} // Disable during upload
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
                  className="w-3/4 px-4 py-3 rounded-2xl border border-white/20 bg-black/30 backdrop-blur-sm focus:ring-2 focus:ring-white/30 resize-none max-h-32 text-white placeholder-white/60"
                  placeholder={isUploadingFile ? "Uploading file..." : "Type your message..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  rows={1}
                  disabled={isUploadingFile}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={(!message.trim() && !selectedFile) || isUploadingFile}
                className="p-3 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: "#fff",
                  opacity: (!message.trim() && !selectedFile) || isUploadingFile ? 0.5 : 1,
                  cursor: (!message.trim() && !selectedFile) || isUploadingFile ? "not-allowed" : "pointer",
                }}
              >
                {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div className="flex flex-col flex-1 items-center justify-center h-full bg-black/30   rounded-xl text-white">
          <MessageCircle className="w-24 h-24 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Welcome to Chat!</h2>
          <p className="text-lg">Select a conversation from the sidebar to start messaging.</p>
        </div>
      )}
      {/* Full-screen image preview modal */}
      {fullScreenImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setFullScreenImageUrl(null)} // Close on background click
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Prevent closing when clicking on the image itself */}
            <img
              src={fullScreenImageUrl || "/placeholder.svg"}
              alt="Full screen image preview"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold"
              onClick={() => setFullScreenImageUrl(null)}
              aria-label="Close image preview"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Audio element for notifications */}
      <audio ref={audioRef} src="/audio/note.mp3" preload="auto" />
      {/* User Profile Panel */}
      {/* User Profile Panel */}
      {showUserProfile && selectedUserId && (
  <aside
    className={`
      w-[300px] h-[475px]
      rounded-[20px]
      border border-[#FFFFFF33]
      bg-[#0000004D]
      flex flex-col
      pt-[24px] pr-[24px] pb-[25px] pl-[24px]
    `}
  >
    {/* Profile Header */}
    <div className="p-6 border-b border-white/10">
      <div className="flex items-center gap-4 mb-4">
        {contacts.find((c) => c.id === selectedUserId)?.avatar ? (
          <img
            src={contacts.find((c) => c.id === selectedUserId)?.avatar || "/placeholder.svg"}
            alt={selectedUser}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}
          >
            {selectedUser[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{selectedUser}</h3>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 px-3 py-2 rounded-md">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0000004D] cursor-pointer">
          <Search className="w-5 h-5 text-white" />
        </div>
        <button
          onClick={() => setShowMeetingDialog(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0000004D] hover:bg-white/20 transition"
          aria-label="Start meeting"
          type="button"
        >
          <Video className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>

    {/* Profile Content */}
    <div className="flex-1 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

      {/* Tabs */}
      <div className="flex mb-4 bg-black/30 rounded-lg overflow-hidden border-t border-b border-white/10">
  <button
    className={`flex-1 py-2 text-sm font-medium border-r border-white/10 ${
      activeTab === "pictures" ? "bg-[#0CA9F6] text-white" : "text-white/60"
    }`}
    onClick={() => setActiveTab("pictures")}
  >
    Pictures
  </button>
  <button
    className={`flex-1 py-2 text-sm font-medium ${
      activeTab === "files" ? "bg-[#0CA9F6] text-white" : "text-white/60"
    }`}
    onClick={() => setActiveTab("files")}
  >
    Files
  </button>
</div>
      {/* Uploaded Files Section */}
      <div className="space-y-3">
        {messages
          .filter((msg) => msg.isFile && msg.fileUrl)
          .filter((fileMsg) =>
            activeTab === "pictures"
              ? fileMsg.fileType?.startsWith("image/")
              : !fileMsg.fileType?.startsWith("image/")
          )
          .map((fileMsg, index) => {
            const isImage = fileMsg.fileType?.startsWith("image/")
            const fileName = fileMsg.fileUrl?.split("/").pop() || "Unknown file"
            const fileExtension = fileName.split(".").pop()?.toLowerCase()

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                {isImage ? (
                  <img
                    src={fileMsg.fileUrl || "/placeholder.svg"}
                    alt="Shared image"
                    className="w-8 h-8 rounded object-cover"
                    onClick={() => setFullScreenImageUrl(fileMsg.fileUrl || "/placeholder.svg")}
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">📎</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{isImage ? "Image" : fileName}</p>
                  <p className="text-white/60 text-xs">
                    {fileMsg.fileType || fileExtension} •{" "}
                    {new Date(fileMsg.timestamp || 0).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={fileMsg.fileUrl || "#"}
                  download={fileName}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </a>
              </div>
            )
          })}

        {/* Empty state */}
        {messages.filter((msg) => msg.isFile && msg.fileUrl && (
          activeTab === "pictures" ? msg.fileType?.startsWith("image/") : !msg.fileType?.startsWith("image/")
        )).length === 0 && (
          <div className="text-center py-8 text-white/60">
            <p>No {activeTab === "pictures" ? "pictures" : "files"} shared yet</p>
          </div>
        )}
      </div>
    </div>
  </aside>
)}
    </div>
  )
}
