"use client"
import { X } from "lucide-react"
import Image from "next/image"

interface TaskDetailsPopupProps {
  onClose: () => void
  task?: any
}

const formatDuration = (start: Date, end: Date) => {
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return "-"

  const diffMs = end.getTime() - start.getTime()
  if (diffMs < 0) return "-"

  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays}d ${Math.floor(diffHours % 24)}h`
}


const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({ onClose, task }) => {

    if (!task) return null;

   // Sprint estimated time
  const sprintEstimatedTime = formatDuration(
    new Date(task.sprint?.startDate),
    new Date(task.sprint?.endDate)
  )

  // Task estimated time (using createdAt → taskDate)
  const taskEstimatedTime = formatDuration(
    new Date(task.createdAt),
    new Date(task.taskDate)
  )


  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0000004D]/100 backdrop-blur-md rounded-2xl p-6 w-[420px] shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >


        {/* Status badge */}
        <div className="absolute top-3 right-12">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-sky-500 text-white">
            {task.status || "In progress"}
          </span>
        </div>

        {/* Ticket Info */}
        <div className="mb-6 space-y-2">
          <div>
            <p className="text-xs text-gray-400">Ticket Number</p>
            <p className="text-white font-medium">{task.ticketNumber || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Sprint Number</p>
            <p className="text-white font-medium">{task.sprint.name || "-"}</p>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 text-sm">
          <div>
            <p className="text-gray-400">Priority</p>
            <p className="text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> {task.priority || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Due date</p>
            <p className="text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center text-xs">
                📅
              </span>{" "}
              {task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "-"}

            </p>
          </div>
          <div>
            <p className="text-gray-400">Assignee</p>
            <p className="text-white flex items-center gap-2">
              {task.taskFor?.avatar ? (
                <Image src={task.taskFor.avatar} alt={task.taskFor.name || "Assignee"} width={20} height={20} className="rounded-full" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">{task.taskFor?.name?.charAt(0) || "A"}</span>
              )}
              {task.taskFor?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Reporter</p>
            <p className="text-white flex items-center gap-2">
              {task.taskOf?.avatar ? (
                <Image src={task.taskOf.avatar} alt={task.taskOf.name || "Reporter"} width={20} height={20} className="rounded-full" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white">{task.taskOf?.name?.charAt(0) || "C"}</span>
              )}
              {task.taskOf?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Estimated time</p>
            <p className="text-white">{taskEstimatedTime || "-"}</p>
          </div>
        </div>

        {/* Task Card */}
        <div className="p-4 rounded-xl bg-[#181c24] border border-white/10 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-semibold">{task.title || "-"}</h4>
            <span className="px-2 py-0.5 text-[10px] bg-orange-500/20 text-orange-400 rounded">
              {task.priority || "-"}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            {task.description || "-"}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex -space-x-2">
              {task.taskFor?.avatar ? (
                <Image src={task.taskFor.avatar} alt={task.taskFor.name || "User"} width={24} height={24} className="rounded-full border-2 border-[#181c24]" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">{task.taskFor?.name?.charAt(0) || "U"}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              ⏱ <span>{sprintEstimatedTime || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailsPopup
