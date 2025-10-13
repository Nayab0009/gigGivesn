"use client"
import { useEffect, useState, useRef } from "react"
import { deleteTask, getTaskById } from "@/lib/TaskService"
import { useAuth } from "@/context/AuthContext"
import { initiateSocket, getSocket } from "@/lib/socket"
import { getMessagesByTask } from "@/lib/chatService"
import { updateTask } from "@/lib/TaskService"

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
  Edit,
  X,
  Trash,
} from "lucide-react"
import { EditTaskModal, TaskPriority } from "../adminDashboard/EditTaskModal"
import { Task } from "@/types"

// Chat message type
type ChatMessage = {
  id?: string | number
  message: string
  timestamp?: number
  senderId?: string
  receiverId?: string
  senderName?: string
  receiverName?: string
  senderAvatar?: string | null
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
  taskOf?: {
    id: number
    name: string
    description?: string
    startDate?: string
    endDate?: string
    status?: string
  }
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
  sprint?: {
    id?: string | number
    createdBy?: {
      id?: string | number
      name?: string
    }
    // Add other sprint properties as needed
  }
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

type TaskDetailsPanelProps = {
  taskId: string | number
  projectId?: string | number;
  onClose?: () => void
  onDelete?: () => void
  refreshData?: () => void
}

export default function TaskDetailsPanel({ taskId, onClose, projectId, onDelete, refreshData }: TaskDetailsPanelProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState<ProjectTask | null>(null)
  const [logs, setLogs] = useState<TaskLog[]>([])
  const [task2, setTask2] = useState<Task>({
    id: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    estimatedHours: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false)
  // Chat state
  const { user: currentUser } = useAuth()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isTaskChat, setIsTaskChat] = useState(false)


  async function fetchTask() {
    setLoading(true)
    setError(null)
    try {
      const taskObj = await getTaskById(String(taskId))
      setTask(taskObj)
      console.log("task obj in task details screen")
      setTask2({
        id: taskObj.id,
        // @ts-ignore – modal expects ticketNumber though it's not in Task type
        ticketNumber: taskObj.ticketNumber,
        title: taskObj.title || '',
        description: taskObj.description || '',
        status: 'pending',
        priority: taskObj.priority || "medium",
        assignedTo: [taskObj.taskFor?.id || ''],
        dueDate: taskObj.taskDate || '',
        estimatedHours: 0,
      });

      const syntheticLogs: TaskLog[] = []
      if (taskObj.createdAt) {
        syntheticLogs.push({
          id: `${taskObj.id}-created`,
          taskId: taskObj.id,
          action: "created",
          timestamp: taskObj.createdAt,
          message: "Task was created",
          time: taskObj.createdAt,
          user: { name: taskObj.taskFor?.name || "System" },
        })
      }
      if (taskObj.updatedAt && taskObj.updatedAt !== taskObj.createdAt) {
        syntheticLogs.push({
          id: `${taskObj.id}-updated`,
          taskId: taskObj.id,
          action: "updated",
          timestamp: taskObj.updatedAt,
          message: `Task status updated to ${taskObj.status}`,
          time: taskObj.updatedAt,
          user: { name: taskObj.taskFor?.name || "System" },
        })
      }
      setLogs(syntheticLogs)
    } catch (err) {
      console.error("Error fetching task:", err)
      setError("Failed to load task details.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskMessages = async () => {
    try {
      const messages = await getMessagesByTask(String(taskId))

      const mappedMessages: ChatMessage[] = messages.map((m: any) => ({
        id: m.id,
        message: m.messageBody || m.message,
        senderId: m.sendBy?.id?.toString(),
        receiverId: m.receivedBy?.id?.toString(),
        senderName:
          m.sendBy?.name ||
          m.senderName ||
          (m.sendBy?.id?.toString() === currentUser?.id.toString()
            ? currentUser?.name
            : task?.taskFor?.name) ||
          "Unknown",
        receiverName: m.receivedBy?.name,
        senderAvatar: m.sendBy?.avatar || null,
        timestamp: new Date(m.createdAt).getTime(),
      }))

      setChatMessages(mappedMessages)
    } catch (err) {
      console.error("Error fetching task messages:", err)
    }
  }
  useEffect(() => {

    fetchTask()
    fetchTaskMessages()
  }, [taskId])

  // Chat: Initialize socket and join task room
  useEffect(() => {
    initiateSocket()
    const socket = getSocket()
    if (!socket) return
    setIsTaskChat(true)
    setCurrentTaskId(String(taskId))

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    // socket.emit("join_task_room", { taskId: String(taskId) })

    const handleTaskMessage = (data: any) => {
      const mappedMessage: ChatMessage = {
        id: data.id || Date.now().toString(),
        message: data.message,
        senderId: data.sendBy?.id?.toString() || data.senderId?.toString(),
        receiverId: data.receivedBy?.id?.toString() || data.receiverId?.toString(),
        senderName:
          data.senderName ||
          (data.senderId?.toString() === currentUser?.id.toString()
            ? currentUser?.name
            : task?.taskFor?.name || task?.sprint?.createdBy?.name) ||
          "Unknown",
        receiverName:
          data.receiverName ||
          (data.receiverId?.toString() === currentUser?.id.toString()
            ? currentUser?.name
            : task?.taskFor?.name || task?.sprint?.createdBy?.name) ||
          "Unknown",
        senderAvatar: data.sendBy?.avatar || null,
        timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
      };


      setChatMessages((prev) => [...prev, mappedMessage]);
    };


    socket.on("taskmessage", handleTaskMessage)

    return () => {
      socket.off("taskmessage", handleTaskMessage)
      socket.emit("leave_task_room", { taskId: String(taskId) })
    }
  }, [currentUser, taskId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])
  const statusOptions = [
    { value: "cancelled", label: "Cancelled" },
    { value: "inprogress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ]
  const handleStatusUpdate = async (newStatus: string) => {
    if (!task) return
    try {
      setUpdatingStatus(true)
      await updateTask(String(task.id), { status: newStatus })
      setTask({ ...task, status: newStatus })
      setStatusDropdownOpen(false)
      if (refreshData) {
        refreshData()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }
  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentUser || !task) return;

    const socket = getSocket();

    // Determine sender and receiver based on role
    let senderId = currentUser.id.toString();
    let receiverId = "";

    if (currentUser.role === "manager") {
      senderId = task.sprint?.createdBy?.id?.toString() || senderId; // manager's id from sprint
      receiverId = task.taskFor?.id?.toString() || "";
    } else if (currentUser.role === "employee") {
      senderId = currentUser.id.toString();
      receiverId = task.sprint?.createdBy?.id?.toString() || "";
    }

    // Local UI message
    const localMsg: ChatMessage = {
      id: Date.now().toString(),
      message: chatInput,
      senderId,
      senderName: currentUser.name,
      receiverId,
      receiverName:
        currentUser.role === "manager"
          ? task.taskFor?.name || "Unknown"
          : task.sprint?.createdBy?.name || "Manager",
      timestamp: Date.now(),
    };
    console.log("Local chat message object:", localMsg);
    setChatMessages((prev) => [...prev, localMsg]);
    setChatInput("");

    const payload = {
      message: chatInput,
      senderId,
      receiverId,
      senderName: currentUser.name,
      receiverName:
        currentUser.role === "manager"
          ? task.taskFor?.name || "Unknown"
          : task.sprint?.createdBy?.name || "Manager",
      taskId: String(task.id),
    };

    console.log("Payload sent to socket:", payload);
    socket?.emit("taskmessage", payload);
  };


  const handleEditClick = () => {
    setShowEditModal(true)
  }
  const handleDeleteTask = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const shouldDelete = window.confirm("Are you sure you want to delete this task?")
    if (shouldDelete) {
      deleteTask(task?.id as string).then(() => {
        onClose?.()
        onDelete?.()
      })
    }
  }
  // Helper: group logs by date (first date badge only)

  // Helper: group logs by date (first date badge only)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const firstLogDateLabel =
    sortedLogs.length > 0
      ? new Date(sortedLogs[0].timestamp).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
      : ""

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
  console.log("task from task detail screen", task)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {showEditModal && (
        <EditTaskModal
          task={task2}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => fetchTask()}
          open={showEditModal}
          setTask={setTask2}
          getUserStatusIcon={() => <div />}
          projectId={task.taskOf?.id}
          sprintId={task?.sprint?.id || ""}
          ticketNumber={task.ticketNumber}

          priority={task.priority as TaskPriority}
        />
      )}
      <div
        className="relative flex border:var(--border-style)]
   [box-shadow:var(--shadow-combined)]  rounded-[22px] shadow-xl overflow-x-auto overflow-y-auto [background:var(--container-bg)] "
        style={{ maxWidth: 1108, maxHeight: 846, width: '100%', height: '100%', padding: 40, gap: 3 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cross Button Above Ticket Number */}
        <div className="absolute left-6 top-2 z-10">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/80 hover:bg-black/80"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Left info column */}
        <div className="flex flex-col text-white/90 w-[330px]">
          {/* Ticket Number */}
          <div className="flex w-full justify-between items-center mt-2">
            {/* Ticket Number */}
            <div>
              <div className="text-[12px] tracking-wide text-text-secondary font-[400] mb-1">
                Ticket Number
              </div>
              <span className="text-[20px] font-[500] text-text-main">
                {task.ticketNumber ?? `TASK-${task.id}`}
              </span>
            </div>

            {/* Status Dropdown - aligned right */}
            {currentUser?.role === "employee" ? (
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  disabled={updatingStatus}
                  className="text-[12px] px-3 py-[6px] rounded-full bg-[#0CA9F6] text-white font-[400] shadow-sm hover:bg-[#0B8FD1] transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {task.status?.replace(/_/g, " ") || "In progress"}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${statusDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {statusDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-36 bg-black/90 border border-white/20 rounded-lg shadow-lg overflow-hidden z-10">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusUpdate(option.value)}
                        className="w-full text-left px-3 py-2 text-[12px] text-white hover:bg-white/10 transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[12px] px-3 py-[6px] rounded-full bg-[#0CA9F6] text-white font-[400] shadow-sm">
                {task.status?.replace(/_/g, " ") || "In progress"}
              </span>
            )}


            {currentUser?.role === "manager" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditClick}
                  className="p-1 rounded hover:bg-white/10 ml-2"
                >
                  <Edit className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="p-1 rounded hover:bg-white/10 ml-2"
                >
                  <Trash className="w-4 h-4 text-white/60" />
                </button>
              </div>
            ) : null}
          </div>



          {/* Sprint Number */}
          <div className="mt-8">
            <div className="text-[12px] tracking-wide text-text-secondary font-[400px] mb-1">
              Sprint Number
            </div>
            <div className="text-[20px] font-[500px] text-text-main">
              {task.taskOf?.name ? `SP1-${task.ticketNumber ?? task.id}` : "—"}
            </div>
          </div>

          {/* Fields */}
          <div className="mt-10 space-y-5 text-sm text-text-main">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <span>Status</span>
              </div>
              <span className="ml-auto font-medium flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-text-secondary" />
                {task.status ?? "New Task"}
              </span>
            </div>

            <div className="flex items-center">
              <span>Priority</span>
              <span className="ml-auto flex items-center gap-1 font-medium">
                <ChevronDown className="w-3 h-3 opacity-70" />
                {task.priority
                  ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                  : "High"}

              </span>
            </div>

            <div className="flex items-center">
              <span>Due date</span>
              <span className="ml-auto font-medium flex items-center gap-2">

                {task.taskDate
                  ? new Date(task.taskDate).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })
                  : "dd/mm/yy"}
              </span>
            </div>

            <div className="flex items-center">
              <span className="flex items-center gap-2">
                Assignee
              </span>
              <span className="ml-auto font-medium flex items-center gap-2">
                {task.taskFor?.avatar ? (
                  <img
                    src={task.taskFor.avatar}
                    alt={task.taskFor.name || "A"}
                    className="w-5 h-5 rounded-full object-cover border border-white/20 bg-white/15 "
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[10px] uppercase text-white/80">
                    {(task.taskFor?.name || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
                {task.taskFor?.name ?? "Unassigned"}
              </span>
            </div>

            {/* <div className="flex items-center">
              <span>Reporter</span>
              <span className="ml-auto font-medium">Me</span>
            </div> */}

            <div className="flex items-center">
              <span>Estimated time</span>
              <span className="ml-auto font-medium">
                <span className="h-4 w-4 rounded-full bg-white/80" />
                {task.estimatedTime
                  ? `${task.estimatedTime}h (spent 0.15h)`
                  : "0.15h (spent 0.15h)"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6 h-px bg-white/30 w-full" />

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-3 ">
              <Circle className="w-3 h-3 text-text-main" />
              <span className="text-text-main">Description</span>
            </div>
            <div className="text-sm leading-relaxed tracking-wide text-text-main">
              {task.description || <span className="text-text-main">Hallow</span>}
            </div>
            <div className="mt-8 h-px bg-white/30 w-full" />
          </div>
        </div>

        {/* Inner right panel flush right */}
        <div className="h-[742px] w-[594px] ml-auto">
          <div className="h-full flex flex-col border:var(--border-style)]
   [box-shadow:var(--shadow-combined)] rounded-[22px] px-8 pt-8 pb-6 [background:var(--container-bg)] "
>
            {/* Date Chip */}
            {firstLogDateLabel && (
              <div className="flex justify-center mb-10">
                <span className="text-[10px] px-3 py-[6px] rounded-full bg-black/50 border border-white/10 text-white/70">
                  {firstLogDateLabel}
                </span>
              </div>
            )}

            {/* Activity / Logs */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {sortedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center text-[12px] text-text-secondary"
                >
                  <span className="pr-4">
                    {log.user?.name || log.userName} {log.message || log.action}
                  </span>
                  <span className="ml-auto text-text-secondary tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}

              {/* Chat messages after logs (if any) */}
              {chatMessages.length > 0 &&
                chatMessages.map((msg, idx) => (
                  <div
                    key={`chat-${idx}`}
                    className={`flex items-center text-[12px] ${msg.senderId === currentUser?.id.toString()
                      ? "text-emerald-300"
                      : "text-white/70"
                      }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[10px] uppercase text-white/80 mr-2">
                      {(msg.senderName || "U").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                    <span className="pr-2 font-medium">
                      {msg.senderId === currentUser?.id.toString() ? "You" : msg.senderName}
                      :
                    </span>
                    <span className="pr-4">{msg.message}</span>

                    <span className="ml-auto text-white/40 tabular-nums">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : ""}
                    </span>
                  </div>
                ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendChat()
              }}
              className="mt-8"
            >
              <div className="flex items-center gap-3 border border-white/10 rounded-full px-4 py-2"
                style={{ background: "#0000004D" }}>
                <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-[11px] text-white/60 uppercase">
                  {(currentUser?.name || "C")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <input
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:bg-black/50 disabled:opacity-40"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}