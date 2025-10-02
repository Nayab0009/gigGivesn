"use client"
import { ChevronDown, Circle, Clock, MessageCircle, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { getTaskById, updateTask } from "@/lib/TaskService"
import { initiateSocket, getSocket } from "@/lib/socket"
import { sendMessage as sendChatMessage } from "@/lib/chatService"
import { Task } from "@/types"



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
  sprint?: any
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

interface TaskDetailsPopupProps {
  onClose: () => void
  task?: any
  taskId?: string | number
}




const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({ onClose, task: initialTask, taskId }) => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState<ProjectTask | null>(initialTask || null)
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
  
  // Chat state
  const auth = useAuth();
  const currentUser = auth?.user || { id: '0', name: 'User' }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)



  async function fetchTask() {
    if (!taskId && !task?.id) return;
    setLoading(true)
    setError(null)
    try {
      const taskObj = await getTaskById(String(taskId || task?.id))
      setTask(taskObj)
      setTask2({
        id: taskObj.id,
        // @ts-ignore – modal expects ticketNumber though it's not in Task type
        ticketNumber: taskObj.tickerNumber,
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


  useEffect(() => {
    if (taskId) {
      fetchTask()
    }
  }, [taskId, task?.id])

  // Chat: Initialize socket and join task room
  useEffect(() => {
    if (!task?.id) return;
    
    initiateSocket()
    const socket = getSocket()
    if (!socket) return
    
    const currentTaskId = String(taskId || task?.id);
    if (currentTaskId) {
      socket.emit("join_task_room", { taskId: currentTaskId })
    }

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
    })

    const handleTaskMessage = (data: any) => {
      const mappedMessage: ChatMessage = {
        id: data.id,
        message: data.message || "",
        timestamp: data.createdAt ? new Date(data.createdAt).getTime() : data.timestamp || Date.now(),
        userId: data.userId,
        username: data.username,
        senderId: data.sendBy?.id?.toString() || data.senderId?.toString(),
        receiverId: data.receivedBy?.id?.toString() || data.receiverId?.toString(),
      }

      if (
        mappedMessage.senderId === currentUser.id.toString() ||
        mappedMessage.receiverId === currentUser.id.toString()
      ) {
        setChatMessages((prev) => [...prev, mappedMessage])
      }
    }

    socket.on("task_message", handleTaskMessage)

    return () => {
      socket.off("task_message", handleTaskMessage)
      const currentTaskId = String(taskId || task?.id);
      if (currentTaskId) {
        socket.emit("leave_task_room", { taskId: currentTaskId })
      }
    }
  }, [currentUser, taskId, task?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])


  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentUser || !task?.id) return
    const socket = getSocket()
    const currentTaskId = String(taskId || task?.id);
    const msg: ChatMessage = {
      message: chatInput,
      userId: currentUser.id.toString(),
      username: currentUser.name,
      senderId: currentUser.id.toString(),
      receiverId: currentTaskId,
      timestamp: Date.now(),
    }
    setChatMessages((prev) => [...prev, msg])
    setChatInput("")
    socket?.emit("task_message", { ...msg, taskId: currentTaskId })
    try {
      await sendChatMessage(currentUser.id, currentTaskId)
    } catch { }
  }



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
  if (!task && !initialTask) return null
  const displayTask = task || initialTask
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="relative flex overflow-x-auto overflow-y-auto"
        style={{
          width: 'min(1108px, 100%)',
          height: '100%',
          maxHeight: '100vh',
          margin: '0',
          borderTopLeftRadius: 22,
          borderBottomLeftRadius: 22,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: '#FFFFFF4D',
          opacity: 1,
          background: '#0000004D',
          backdropFilter: 'blur(100px)',
          WebkitBackdropFilter: 'blur(100px)',
          boxSizing: 'border-box',
          transition: 'transform 0.3s ease-in-out',
        }}
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
        <div
          className="flex flex-col text-white/90"
          style={{
            width: 'min(351px, 100%)',
            maxWidth: '100%',
            height: 'auto',
            position: 'absolute',
            top: 50,
            left: 30,
            opacity: 1,
            gap: 22,
            borderBottom: '1px solid #FFFFFF4D',
            paddingBottom: 32,
            boxSizing: 'border-box',
            overflow: 'auto',
          }}
        >
          {/* Ticket Number */}
          <div className="flex w-full justify-between items-center">
            {/* Ticket Number */}
            <div>
              <div>
                  <span
                    style={{
                      fontFamily: 'Roboto',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: 12,
                      lineHeight: '28px',
                      letterSpacing: 0,
                      verticalAlign: 'middle',
                      color: '#A4A7AE',
                    }}
                  >
                    Ticket Number
                  </span>
              </div>
              <span 
              style={{
                      fontFamily: 'Roboto',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: 20,
                      lineHeight: '28px',
                      letterSpacing: 0,
                      verticalAlign: 'middle',
                      color: '#FFFFFF',
                    }}
                    >
                {displayTask.ticketNumber ?? `TASK-${displayTask.id}`}
              </span>
            </div>

           
           {/* Status badge */}
              <span 
                style={{
                  fontFamily: 'Roboto',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: 12,
                  lineHeight: '28px',
                  letterSpacing: 0,
                  verticalAlign: 'middle',
                  color: '#FFFFFF',
                  background: '#0CA9F6',
                  width: 84,
                  height: 28,
                  opacity: 1,
                  borderRadius: 99,
                  gap: 10,
                  paddingRight: 12,
                  paddingLeft: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {displayTask.status?.replace(/_/g, " ") || "In progress"}
              </span>
          </div>



          {/* Sprint Number */}
          <div>
            <div >
              <span
                style={{
                  fontFamily: 'Roboto',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: 12,
                  lineHeight: '28px',
                  letterSpacing: 0,
                  verticalAlign: 'middle',
                  color: '#A4A7AE',
                }}
              >
                Sprint Number
              </span>
            </div>
            <div 
            style={{
                      fontFamily: 'Roboto',
                      fontWeight: 500,
                      fontStyle: 'normal',
                      fontSize: 20,
                      lineHeight: '28px',
                      letterSpacing: 0,
                      verticalAlign: 'middle',
                      color: '#FFFFFF',
                    }}
            >
              {displayTask.taskOf?.name ? `SP1-${displayTask.ticketNumber ?? displayTask.id}` : "—"}
            </div>
          </div>

          {/* Fields */}
          <div 
            style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: 0,
              verticalAlign: 'middle',
              color: '#A4A7AE',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}
          >
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <span>Status</span>
              </div>
              <span className="ml-auto font-medium flex items-center gap-2">
                <Circle className="w-[20px] h-[20px] bg-[#D9D9D9] rounded-full" />
                {displayTask.status ?? "New Task"}
              </span>
            </div>

            <div className="flex items-center">
              <span>Priority</span>
              <span className="ml-auto flex items-center gap-1 font-medium">
                <ChevronDown className="w-3 h-3 opacity-70" />
                {displayTask.priority
                  ? displayTask.priority.charAt(0).toUpperCase() + displayTask.priority.slice(1)
                  : "High"}
              </span>
            </div>

            <div className="flex items-center">
              <span>Due date</span>
              <span className="ml-auto font-medium flex items-center gap-2">
                
                <Circle className="w-[20px] h-[20px] bg-[#D9D9D9] rounded-full" />
                {displayTask.taskDate
                  ? new Date(displayTask.taskDate).toLocaleDateString(undefined, {
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
                {displayTask.taskFor?.avatar ? (
                  <img
                    src={displayTask.taskFor.avatar}
                    alt={displayTask.taskFor.name || "A"}
                    className="w-5 h-5 rounded-full object-cover border border-white/20 bg-white/15"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-[10px] uppercase text-white/80">
                    {(displayTask.taskFor?.name || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
                {displayTask.taskFor?.name ?? "Unassigned"}
              </span>
            </div>


            <div className="flex items-center">
              <span>Estimated time</span>
              <span className="ml-auto font-medium">
                <span className="h-4 w-4 rounded-full bg-white/80" />
                
                {displayTask.estimatedTime
                  ? `${displayTask.estimatedTime}h (spent 0.15h)`
                  : "0.15h (spent 0.15h)"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6 h-px bg-white/30 w-full" />

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Circle className="w-[20px] h-[20px] bg-[#D9D9D9] rounded-full" />
              <span
              style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: 0,
              verticalAlign: 'middle',
              color: '#A4A7AE',
              // display: 'flex',
              // flexDirection: 'column',
              // gap: 22,
            }}
              >Description</span>
            </div>
            <div className="text-sm leading-relaxed tracking-wide"
            style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: 14,
              lineHeight: '20px',
              letterSpacing: 0,
              verticalAlign: 'middle',
              color: '#A4A7AE',
              // display: 'flex',
              // flexDirection: 'column',
              // gap: 22,
            }}
            >
              {displayTask.description || "No description available"}
            </div>
            {/* <div className="mt-8 h-px bg-white/30 w-full" /> */}
          </div>
        </div>

        {/* Inner right panel flush right */}
        <div className="h-full ml-auto" style={{ maxWidth: '100%' }}>
          <div
            className="h-full flex flex-col"
            style={{
              width: 'min(594px, calc(100% - 20px))',
              height: 'calc(100% - 60px)',
              position: 'absolute',
              top: 30,
              left: 'auto',
              right: 30,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: '#FFFFFF4D',
              opacity: 1,
              borderRadius: 22,
              padding: 30,
              gap: 38,
              background: '#0000004D',
              boxSizing: 'border-box',
              overflow: 'auto',
              // angle: 0 deg (not a valid CSS property)
            }}
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
            <div
              className="flex-1 overflow-y-auto space-y-4 pr-1"
              style={{
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE 10+
              }}
            >
              <style>{`
                .flex-1::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {sortedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center text-[12px] text-white/75"
                >
                  <span className="pr-4">
                    {log.user?.name || log.userName} {log.message || log.action}
                  </span>
                  <span className="ml-auto text-white/40 tabular-nums">
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
                    className={`flex items-center text-[12px] ${msg.userId === currentUser?.id.toString()
                      ? "text-emerald-300"
                      : "text-white/70"
                      }`}
                  >
                    <span className="pr-2 font-medium">{msg.username ?? "User"}:</span>
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
    // </div>
  )
}

export default TaskDetailsPopup;
