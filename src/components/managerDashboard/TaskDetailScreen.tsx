"use client"
import { useEffect, useState, useRef } from "react"
import { getTaskById } from "@/lib/TaskService"
import { useAuth } from "@/context/AuthContext"
import { initiateSocket, getSocket } from "@/lib/socket"
import { sendMessage as sendChatMessage } from "@/lib/chatService"
// Chat message type
type ChatMessage = {
  id?: string
  message: string
  timestamp?: number
  userId?: string
  username?: string
  senderId?: string
  receiverId?: string
}

// Define custom types needed for the component
type ProjectTask = {
  id: string | number
  title: string
  description?: string
  status?: string
  statusLabel?: string
  priority?: string
  taskDate?: string
  ticketNumber?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  comment?: string | null
  // Project reference
  taskOf?: {
    id: number
    name: string
    description?: string
    startDate?: string
    endDate?: string
    status?: string
  }
  // Assignee
  taskFor?: { 
    id: number
    name: string 
    email?: string
    avatar?: string | null
    role?: string
  }
  createdBy?: { name: string }
  estimatedTime?: string
  logs?: TaskLog[]
}

type TaskLog = {
  id: string | number
  taskId: string | number
  userId?: string | number
  userName?: string
  action: string
  timestamp: string
  details?: string
  message?: string
  time?: string
  user?: { name: string }
}
import {
  ChevronDown,
  Calendar,
  User,
  Circle,
  Clock,
  CheckCircle2,
  Plus,
  LogIn,
  LogOut,
  Timer,
  MessageCircle,
  MoreHorizontal,
  Edit,
  X,
} from "lucide-react"

type TaskDetailsPanelProps = {
  taskId: string | number
  onClose?: () => void
}

export default function TaskDetailsPanel({ taskId, onClose }: TaskDetailsPanelProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState<ProjectTask | null>(null)
  const [logs, setLogs] = useState<TaskLog[]>([])

  // Chat state
  const { user: currentUser } = useAuth()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchTask() {
      setLoading(true)
      setError(null)
      try {
        // Convert taskId to string since the API expects a string
        const taskObj = await getTaskById(String(taskId))
        console.log("Task data:", taskObj);
        setTask(taskObj)
        // Create synthetic logs from task data since API doesn't provide logs
        const syntheticLogs: TaskLog[] = [];
        // Add creation log
        if (taskObj.createdAt) {
          syntheticLogs.push({
            id: `${taskObj.id}-created`,
            taskId: taskObj.id,
            action: "created",
            timestamp: taskObj.createdAt,
            message: "Task was created",
            time: taskObj.createdAt,
            user: { name: taskObj.taskFor?.name || "System" }
          });
        }
        // Add status log if updated
        if (taskObj.updatedAt && taskObj.updatedAt !== taskObj.createdAt) {
          syntheticLogs.push({
            id: `${taskObj.id}-updated`,
            taskId: taskObj.id,
            action: "updated",
            timestamp: taskObj.updatedAt,
            message: `Task status updated to ${taskObj.status}`,
            time: taskObj.updatedAt,
            user: { name: taskObj.taskFor?.name || "System" }
          });
        }
        setLogs(syntheticLogs);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to load task details.")
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [taskId])

  // Chat: Initialize socket and join task room
  useEffect(() => {
    if (!currentUser) return
    initiateSocket(currentUser.id.toString())
    const socket = getSocket()
    if (!socket) return
    // Join a room for this task
    socket.emit("join_task_room", { taskId: String(taskId) })
    // Listen for incoming messages
    socket.on("task_message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg])
    })
    // Optionally: fetch previous messages for this task from your backend here
    return () => {
      socket.off("task_message")
      socket.emit("leave_task_room", { taskId: String(taskId) })
    }
  }, [currentUser, taskId])

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentUser) return
    const socket = getSocket()
    const msg: ChatMessage = {
      message: chatInput,
      userId: currentUser.id.toString(),
      username: currentUser.name,
      senderId: currentUser.id.toString(),
      receiverId: String(taskId), // Use taskId as receiver/room
      timestamp: Date.now(),
    }
    setChatMessages((prev) => [...prev, msg])
    setChatInput("")
    // Emit to socket
    socket?.emit("task_message", { ...msg, taskId: String(taskId) })
    // Optionally: persist to backend
    try {
      await sendChatMessage(currentUser.id, taskId)
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Clock className="animate-spin w-8 h-8 text-emerald-400" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-6 border border-red-200/40 rounded-2xl text-white w-full mx-auto bg-black/30">
        <div className="flex items-center gap-2 mb-1">
          <Circle className="w-5 h-5 text-red-300" />
          <div className="font-semibold">Error loading task</div>
        </div>
        <div className="text-white/80 text-sm">{error}</div>
      </div>
    )
  }
  if (!task) return null

  // Example field extraction
  const statusColor = {
    new: "bg-sky-400",
    inprogress: "bg-emerald-400",
    completed: "bg-emerald-700",
    cancelled: "bg-rose-400",
  }[task.status?.toLowerCase() || "new"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4 bg-black/40 border border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-[560px]">
      {/* Left: Task Details */}
      <div className="p-6 flex flex-col gap-4 border-r border-white/10 backdrop-blur-md" style={{ minWidth: 320 }}>
        {/* Top: Breadcrumb + Edit */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-white/60">
            {task.taskOf ? `${task.taskOf.name} / ` : ""}
            {task.title}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-white/10">
              <Edit className="w-4 h-4 text-white/60" />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* Ticket + status */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{task.ticketNumber ?? `TASK-${task.id}`}</span>
          <span
            className="flex items-center text-xs px-2 py-1 rounded-full border bg-white/10 border-white/20 font-semibold capitalize"
            style={{ color: "#0CA9F6" }}
          >
            {task.status ?? "New Task"}
            <ChevronDown className="w-3 h-3 ml-1" />
          </span>
        </div>
        {/* Meta fields */}
        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-blue-400" />
            <span className="capitalize">{task.status ?? "New Task"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Due date</span>
            <span className="ml-auto font-semibold">
              {task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Assignee</span>
            <span className="ml-auto font-semibold">{task.taskFor?.name ?? "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Project</span>
            <span className="ml-auto font-semibold">{task.taskOf?.name ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Created at</span>
            <span className="ml-auto font-semibold">
              {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Priority</span>
            <span
              className={`ml-auto font-semibold capitalize ${
                task.priority === "high"
                  ? "text-red-400"
                  : task.priority === "medium"
                    ? "text-yellow-300"
                    : "text-emerald-400"
              }`}
            >
              {task.priority ?? "—"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-800">
            <Plus className="w-4 h-4" /> Add Subtask
          </button>
          <button className="bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-800">
            <LogIn className="w-4 h-4" /> Attach File
          </button>
          <button className="bg-orange-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-orange-800">
            <Timer className="w-4 h-4" /> Start Timer
          </button>
          <button className="bg-gray-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-800">
            <LogOut className="w-4 h-4" /> Log Time
          </button>
        </div>

        {/* Description */}
        <div className="mt-4">
          <div className="text-white/70 text-xs mb-1">Description</div>
          <div className="text-white/90 text-sm font-medium">
            {task.description || <span className="text-white/40">No description provided</span>}
          </div>
        </div>
      </div>

      {/* Right: Task Chat */}
      <div className="flex flex-col h-full bg-black/20">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="font-semibold text-white/80">Task Chat</div>
        </div>
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-white/40 text-sm text-center mt-12">No messages yet</div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex items-center gap-2 text-xs ${msg.userId === currentUser?.id.toString() ? "text-emerald-300" : "text-white/70"}`}>
                  <span className="font-semibold">{msg.username ?? "User"}:</span>
                  <span>{msg.message}</span>
                  <span className="ml-auto text-white/40">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        {/* Chat input */}
        <div className="border-t border-white/10 px-6 py-4">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); handleSendChat(); }}>
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none"
              placeholder="Type a message…"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1"
              disabled={!chatInput.trim()}
            >
              <MessageCircle className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
