"use client"
import { useRouter } from "next/navigation"
import { Table, LayoutGrid, ChevronDown } from "lucide-react"
import { type ProjectTask } from "@/lib/ProjectService"

type TasksTabProps = {
  project: {
    id: number
    name: string
    [key: string]: any
  }
  tasks: ProjectTask[]
  taskCounts: {
    totalTask: number
    inProgressTask: number
    completedTask: number
    cancelledTask: number
  }
  taskView: "table" | "kanban"
  setTaskView: (view: "table" | "kanban") => void
}

const TasksTab = ({ project, tasks, taskCounts, taskView, setTaskView }: TasksTabProps) => {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* View toggle buttons (moved from main component) */}
      <div className="flex justify-end">
        <div
          className="flex border border-white/20 rounded-full p-1 gap-1 shadow-inner"
          style={{ background: "#0000004D" }}
        >
          <button
            onClick={() => setTaskView("table")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${taskView === "table"
              ? "bg-white/10 text-white border border-white/20"
              : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
          >
            <Table className="w-4 h-4" /> Table View
          </button>
          <button
            onClick={() => setTaskView("kanban")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${taskView === "kanban"
              ? "bg-white/10 text-white border border-white/20"
              : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent"
              }`}
          >
            <LayoutGrid className="w-4 h-4" /> Kanban Board
          </button>
        </div>
      </div>

      {taskView === "table" ? (
        <div className="space-y-6">
          {/* Active Tasks Table */}
          <div className="rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: "#0000004D" }}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-white/70 text-sm border-b border-white/10">
                    <th className="px-6 py-3 text-left font-medium">
                      <div className="flex items-center gap-2 text-white">
                        <ChevronDown className="w-4 h-4 text-white/80" />
                        <span className="font-semibold">Active tasks</span>
                        <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">
                          {taskCounts.inProgressTask}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-white text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-left font-medium ">Due Date</th>
                    <th className="px-6 py-3 text-left font-medium">Priority</th>
                    <th className="px-6 py-3 text-left font-medium">Assignee</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {tasks
                    .filter((t) => t.status?.toLowerCase() === "inprogress")
                    .map((t) => (
                      <tr
                        key={t.id}
                        className="text-white text-sm border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5"
                        onClick={() => router.push(`/dashboard/manager/tasks/${t.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {t.title}
                          <span className="ml-2 text-white/50 text-xs">{t.ticketNumber ?? `#${t.id}`}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            In Progress
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            <span>{t.description ? "Task" : "—"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          {t.taskDate ? new Date(t.taskDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <ChevronDown
                              className={`w-4 h-4 ${t.priority === "high"
                                ? "text-red-400"
                                : t.priority === "medium"
                                  ? "text-yellow-300"
                                  : "text-emerald-400"
                                }`}
                            />
                            <span className="capitalize">{t.priority}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                              <img
                                src={t.taskFor?.avatar ?? "/images/user/1.png"}
                                alt="Assignee"
                                className="w-6 h-6 rounded-full"
                              />
                            </span>
                            <span className="text-white/80 text-sm font-medium">
                              {t.taskFor?.name ?? "Unassigned"}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  {tasks.filter((t) => t.status?.toLowerCase() === "inprogress").length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-white/60 text-sm" colSpan={8}>
                        No active tasks
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 text-white/70 text-sm">+ Create task</div>
          </div>

          {/* Completed Tasks Table */}
          <div className="rounded-2xl border border-white/10 backdrop-blur-xl" style={{ background: "#0000004D" }}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-white/70 text-sm border-b border-white/10">
                    <th className="px-6 py-3 text-left font-medium">
                      <div className="flex items-center gap-2 text-white">
                        <ChevronDown className="w-4 h-4 text-white/80" />
                        <span className="font-semibold">Completed Task</span>
                        <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">
                          {taskCounts.completedTask}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-white text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-left font-medium ">Due Date</th>
                    <th className="px-6 py-3 text-left font-medium">Priority</th>
                    <th className="px-6 py-3 text-left font-medium">Assignee</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {tasks
                    .filter((t) => t.status?.toLowerCase() === "completed")
                    .map((t) => (
                      <tr
                        key={t.id}
                        className="text-white text-sm border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5"
                        onClick={() => router.push(`/dashboard/manager/tasks/${t.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {t.title}
                          <span className="ml-2 text-white/50 text-xs">{t.ticketNumber ?? `#${t.id}`}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            <span>{t.description ? "Task" : "—"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          {t.taskDate ? new Date(t.taskDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <ChevronDown
                              className={`w-4 h-4 ${t.priority === "high"
                                ? "text-red-400"
                                : t.priority === "medium"
                                  ? "text-yellow-300"
                                  : "text-emerald-400"
                                }`}
                            />
                            <span className="capitalize">{t.priority}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                              <img
                                src={t.taskFor?.avatar ?? "/images/user/1.png"}
                                alt="Assignee"
                                className="w-6 h-6 rounded-full"
                              />
                            </span>
                            <span className="text-white/80 text-sm font-medium">
                              {t.taskFor?.name ?? "Unassigned"}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  {tasks.filter((t) => t.status?.toLowerCase() === "completed").length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-white/60 text-sm" colSpan={8}>
                        No completed tasks
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-center py-8">
          <LayoutGrid className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/70">Kanban board view is under development</p>
        </div>
      )}
    </div>
  )
}

export default TasksTab
