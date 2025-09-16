"use client"
import { useEffect, useState } from "react"
import {
  getProjectTaskById, // <-- Make sure you have this in your ProjectService
  type ProjectTask,
  type TaskLog // <-- Add this type in your API types
} from "@/lib/ProjectService"
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
  Edit
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

  useEffect(() => {
    async function fetchTask() {
      setLoading(true)
      setError(null)
      try {
        const resp = await getProjectTaskById(taskId)
        setTask(resp.data)
        setLogs(resp.data.logs || [])
      } catch {
        setError("Failed to load task details.")
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [taskId])

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
    "new": "bg-sky-400",
    "inprogress": "bg-emerald-400",
    "completed": "bg-emerald-700",
    "cancelled": "bg-rose-400"
  }[task.status?.toLowerCase() || "new"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4 bg-black/40 border border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-[560px]">
      {/* Left: Task Details */}
      <div className="p-6 flex flex-col gap-4 border-r border-white/10 backdrop-blur-md" style={{ minWidth: 320 }}>
        {/* Top: Breadcrumb + Edit */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-white/60">
            {task.projectName ? `${task.projectName} / ` : ""}{task.title}
          </div>
          <button className="p-1 rounded hover:bg-white/10"><Edit className="w-4 h-4 text-white/60" /></button>
        </div>

        {/* Ticket + status */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{task.ticketNumber ?? `TASK-${task.id}`}</span>
          <span className="flex items-center text-xs px-2 py-1 rounded-full border bg-white/10 border-white/20 font-semibold capitalize" style={{ color: "#0CA9F6" }}>
            {task.status ?? "New Task"}
            <ChevronDown className="w-3 h-3 ml-1" />
          </span>
        </div>
        {/* Meta fields */}
        <div className="space-y-2 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Circle className={`w-3 h-3 ${statusColor}`} />
            <span>{task.statusLabel ?? "New Task"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Due date</span>
            <span className="ml-auto font-semibold">{task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Assignee</span>
            <span className="ml-auto font-semibold">{task.taskFor?.name ?? "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Reporter</span>
            <span className="ml-auto font-semibold">{task.createdBy?.name ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Estimated time</span>
            <span className="ml-auto font-semibold">{task.estimatedTime ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Priority</span>
            <span className={`ml-auto font-semibold capitalize ${
              task.priority === "high" ? "text-red-400" : task.priority === "medium" ? "text-yellow-300" : "text-emerald-400"
            }`}>{task.priority ?? "—"}</span>
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

      {/* Right: Chat/Log */}
      <div className="flex flex-col h-full bg-black/20">
        {/* History/Activity header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="font-semibold text-white/80">Activity</div>
          <button className="p-1 rounded hover:bg-white/10">
            <MoreHorizontal className="w-5 h-5 text-white/60" />
          </button>
        </div>
        {/* Chat/Log area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-white/40 text-sm text-center mt-12">No activity yet</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-white/70">
                  <span className="font-semibold">{log.user?.name ?? "System"}:</span>
                  <span>{log.message}</span>
                  <span className="ml-auto text-white/40">{log.time ? new Date(log.time).toLocaleTimeString() : ""}</span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Chat input */}
        <div className="border-t border-white/10 px-6 py-4">
          <form className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white focus:outline-none"
              placeholder="Type a message…"
              disabled
            />
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1" disabled>
              <MessageCircle className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}