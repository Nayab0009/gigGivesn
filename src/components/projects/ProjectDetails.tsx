"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getProjectTeam,
  getProjectTaskCounts,
  getProjectTaskPriorities,
  getProjectMemberTaskCounts,
  getProjectTasks,
  type MemberTaskCount,
  type ProjectTask,
  // add updateProjectName if you have it
} from "@/lib/ProjectService"
import {
  AlertCircle,
  RefreshCw,
  Filter,
  CheckCircle2,
  RefreshCcw,
  XCircle,
  Table,
  LayoutGrid,
  Save,
  Settings as SettingsIcon,
  Users,
  Clock,
  ChevronDown,
  MoreHorizontal
} from "lucide-react"
import TimeTable from "./ProjectTimeTable"
import { 
  SummaryTab, 
  TasksTab, 
  CalendarTab, 
  MembersTab, 
  SettingsTab 
} from "./tabs"

type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status?: string
  isActive?: boolean
}

type Manager = {
  id: string
  name: string
  email: string
  role?: string
  isActive?: boolean
}

type Project = {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  status?: string
  isActive?: boolean
  teamMembers?: TeamMember[]
  manager?: Manager
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  // For summary, tasks, etc.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [taskCounts, setTaskCounts] = useState({
    totalTask: 0,
    inProgressTask: 0,
    completedTask: 0,
    cancelledTask: 0,
  })
  const [taskPriorities, setTaskPriorities] = useState({
    highTask: 0,
    lowTask: 0,
    mediumTask: 0,
  })
  const [memberTaskCounts, setMemberTaskCounts] = useState<MemberTaskCount[]>([])
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  // For members tab only
  const [membersLoading, setMembersLoading] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])

  const [activeTab, setActiveTab] = useState<
    "summary" | "tasks" | "calendar" | "notes" | "members" | "settings"
  >("summary")
  const [taskView, setTaskView] = useState<"table" | "kanban">("table")

  // Settings state
  const [settingsProjectName, setSettingsProjectName] = useState("")
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  console.log("activeTab:", activeTab);
  // Fetch summary data (except for members tab)
  useEffect(() => {
    let isMounted = true
    const fetchAll = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (!id) return
        const resp = await getProjectTeam(String(id))
        if (!isMounted) return
        setProject(resp.data)
        setSettingsProjectName(resp.data.name) // initialize settings field
        // Fetch task counts, priorities, member task counts, tasks
        const [countsResponse, prioritiesResponse, memberTasksResponse, projectTasks] = await Promise.all([
          getProjectTaskCounts(id),
          getProjectTaskPriorities(id),
          getProjectMemberTaskCounts(id),
          getProjectTasks(id),
        ])
        setTaskCounts(countsResponse)
        setTaskPriorities(prioritiesResponse)
        setMemberTaskCounts(memberTasksResponse)
        setTasks(projectTasks)
      } catch (e) {
        if (!isMounted) return
        setError("Failed to load project. Please try again.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    if (activeTab !== "members") fetchAll()
    return () => {
      isMounted = false
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab])

  // Fetch only members list for members tab
  useEffect(() => {
    let isMounted = true
    if (activeTab === "members" && id) {
      setMembersLoading(true)
      getProjectTeam(String(id))
        .then((resp) => {
          if (!isMounted) return
          setMembers(resp.data.teamMembers || [])
        })
        .catch(() => {
          if (!isMounted) return
          setMembers([])
        })
        .finally(() => {
          if (isMounted) setMembersLoading(false)
        })
    }
    return () => {
      isMounted = false
    }

  }, [activeTab, id])

  // When switching to the Tasks tab, refresh tasks to keep them up to date
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id) return
      try {
        const [countsResponse, prioritiesResponse, memberTasksResponse, projectTasks] = await Promise.all([
          getProjectTaskCounts(id),
          getProjectTaskPriorities(id),
          getProjectMemberTaskCounts(id),
          getProjectTasks(id),
        ])
        setTaskCounts(countsResponse)
        setTaskPriorities(prioritiesResponse)
        setMemberTaskCounts(memberTasksResponse)
        setTasks(projectTasks)
      } catch {
        // silent
      }
    }
    if (activeTab === "tasks") {
      fetchTaskData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // When switching to settings, populate field with current name
  useEffect(() => {
    if (activeTab === "settings" && project) {
      setSettingsProjectName(project.name)
      setSettingsSuccess(false)
      setSettingsError(null)
    }
  }, [activeTab, project])

  // Example update function (replace with your actual updateProjectName)
  async function updateProjectName(projectId: number, name: string) {
    // TODO: Replace with real API call
    // Simulate API delay
    return new Promise<{ success: boolean; data?: Project; error?: string }>((resolve) => {
      setTimeout(() => {
        if (name.trim().length === 0) {
          resolve({ success: false, error: "Project name cannot be empty." })
        } else {
          resolve({
            success: true,
            data: {
              ...project!,
              name,
            },
          })
        }
      }, 1200)
    })
  }

  async function handleProjectNameSave() {
    if (!project) return
    setSettingsSaving(true)
    setSettingsSuccess(false)
    setSettingsError(null)
    try {
      const resp = await updateProjectName(project.id, settingsProjectName.trim())
      if (resp.success && resp.data) {
        setProject(resp.data)
        setSettingsSuccess(true)
      } else {
        setSettingsError(resp.error ?? "Failed to update project name.")
      }
    } catch {
      setSettingsError("Failed to update project name.")
    } finally {
      setSettingsSaving(false)
    }
  }

  const statCards = [
    {
      label: "Completed",
      value: taskCounts.completedTask,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      subText: "in the last 7 days",
    },
    {
      label: "In Progress",
      value: taskCounts.inProgressTask,
      icon: <RefreshCcw className="w-5 h-5 text-sky-400" />,
      subText: "in the last 7 days",
    },
    {
      label: "Cancelled",
      value: taskCounts.cancelledTask,
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      subText: "in the last 7 days",
    },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-sm">Project</div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
              {project ? project.name : isLoading ? "Loading…" : "—"}
            </h1>
          </div>
        </div>

        {/* Tabs + view toggles */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-white/70 hover:text-white px-2 py-1 rounded-full transition-all focus:outline-none">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
            <div
              className="flex border border-white/20 rounded-full p-1 gap-1 shadow-inner"
              style={{ background: "#0000004D" }}
            >
              {[
                { key: "summary", label: "Summary" },
                { key: "tasks", label: "Tasks" },
                { key: "calendar", label: "Calendar" },
                // { key: "notes", label: "Notes" },
                { key: "members", label: "Members" },
                { key: "settings", label: "Settings" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                    activeTab === t.key
                      ? "bg-[#0000004D] text-white shadow border border-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                  style={{ minWidth: 90 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
          {activeTab === "tasks" && (
            <div
              className="flex border border-white/20 rounded-full p-1 gap-1 shadow-inner"
              style={{ background: "#0000004D" }}
            >
              <button
                onClick={() => setTaskView("table")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                  taskView === "table"
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                <Table className="w-4 h-4" /> Table View
              </button>
              <button
                onClick={() => setTaskView("kanban")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${
                  taskView === "kanban"
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Kanban Board
              </button>
            </div>
          )}
        </div>

        {/* Content */}
      {isLoading && activeTab !== "members" && activeTab !== "settings" ? (
  <div className="p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto" style={{ background: "#0000004D" }}>
    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
    </div>
    <p className="text-white/80">Loading project…</p>
  </div>
) : error && activeTab !== "members" && activeTab !== "settings" ? (
  <div className="p-6 border border-red-200/40 rounded-2xl text-white max-w-xl w-full mx-auto" style={{ background: "#0000004D" }}>
    <div className="flex items-center gap-2 mb-1">
      <AlertCircle className="w-5 h-5 text-red-300" />
      <div className="font-semibold">Error loading project</div>
    </div>
    <div className="text-white/80 text-sm">{error}</div>
  </div>
) : activeTab === "settings" ? (
  <SettingsTab 
    project={project} 
    settingsProjectName={settingsProjectName}
    setSettingsProjectName={setSettingsProjectName}
    settingsSaving={settingsSaving}
    settingsSuccess={settingsSuccess}
    settingsError={settingsError}
    handleProjectNameSave={handleProjectNameSave}
  />
        ) : activeTab === "members" ? (
  <MembersTab 
    project={project} 
    membersLoading={membersLoading} 
    members={members} 
  />
        ) : project ? (
          <div className="space-y-6">


            {activeTab === "calendar" ? (
              <CalendarTab projectId={project.id} />

            ) : activeTab === "tasks" ? (
              taskView === "table" ? (
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
                                      className={`w-4 h-4 ${
                                        t.priority === "high"
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
                            <th className="px-6 py-3 text-left font-medium">Status</th>
                            <th className="px-6 py-3 text-left font-medium ">Type</th>
                            <th className="px-6 py-3 text-left font-medium ">Due Date</th>
                            <th className="px-6 py-3 text-left font-medium ">Priority</th>
                            <th className="px-6 py-3 text-left font-medium ">Assignee</th>
                          </tr>
                        </thead>
                        <tbody className="bg-transparent">
                          {tasks
                            .filter((t) => t.status?.toLowerCase() === "completed")
                            .map((t) => (
                              <tr 
                                key={`completed-${t.id}`} 
                                className="text-white text-sm border-b border-white/10 last:border-b-0 cursor-pointer hover:bg-white/5"
                                onClick={() => router.push(`/dashboard/manager/tasks/${t.id}`)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                  {t.ticketNumber ?? `TASK-${t.id}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">Completed</td>
                                <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">Task</td>
                                <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                  {t.taskDate ? new Date(t.taskDate).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-l border-white/10">
                                  <span className="inline-flex items-center gap-2">
                                    <ChevronDown
                                      className={`w-4 h-4 ${
                                        t.priority === "high"
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
                                  {t.taskFor?.name ?? "Unassigned"}
                                </td>
                              </tr>
                            ))}
                          {tasks.filter((t) => t.status?.toLowerCase() === "completed").length === 0 && (
                            <tr>
                              <td className="px-6 py-6 text-white/60 text-sm" colSpan={8}>
                                No completed tasks yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Kanban board view */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {(
                    [
                      { key: "cancelled", title: "Cancelled" },
                      { key: "new", title: "New Task" },
                      { key: "inprogress", title: "In Progress" },
                      { key: "completed", title: "Completed" },
                    ] as const
                  ).map((col) => {
                    const columnTasks = tasks.filter((t) => {
                      const s = t.status?.toLowerCase()
                      if (col.key === "new") return !["inprogress", "completed", "cancelled"].includes(s || "")
                      return s === col.key
                    })
                    const count = columnTasks.length
                    return (
                      <div
                        key={col.key}
                        className="rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col"
                        style={{ background: "#0000004D" }}
                      >
                        <div className="px-4 sm:px-5 py-3 border-b border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                              <span className="text-white font-semibold text-sm">{col.title}</span>
                              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] bg-white/10 text-white/80">
                                {count}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 sm:p-5 space-y-3 min-h-[420px]">
                          {columnTasks.map((t) => (
                            <div
                              key={`${col.key}-${t.id}`}
                              className="rounded-xl border border-white/10 bg-black/30 text-white p-4 shadow-sm cursor-pointer hover:bg-black/40"
                              onClick={() => router.push(`/dashboard/manager/tasks/${t.id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="text-xs text-white/60 font-semibold">
                                  {t.ticketNumber ?? `TASK-${t.id}`}
                                </div>
                                <span
                                  className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                                    t.priority === "high"
                                      ? "bg-red-500/20 text-red-300 border-red-300/30"
                                      : t.priority === "medium"
                                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-300/30"
                                      : "bg-emerald-500/20 text-emerald-300 border-emerald-300/30"
                                  }`}
                                >
                                  {t.priority}
                                </span>
                              </div>
                              <div className="mt-1 font-semibold">{t.title}</div>
                              {t.description && <div className="text-sm text-white/70 mt-1">{t.description}</div>}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  <img
                                    src={t.taskFor?.avatar ?? "/images/user/1.png"}
                                    className="w-7 h-7 rounded-full border border-white/20"
                                    alt="Assignee"
                                  />
                                </div>
                                <div className="flex items-center gap-1 text-white/70 text-sm">
                                  <Clock className="w-4 h-4" />
                                  {t.taskDate ? new Date(t.taskDate).toLocaleDateString() : "—"}
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end">
                                <button className="p-1.5 rounded-full hover:bg-white/10">
                                  <MoreHorizontal className="w-4 h-4 text-white/70" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {columnTasks.length === 0 && (
                            <div className="text-white/60 text-sm">No tasks</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              // Summary tab content
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statCards.map((c) => (
                    <div
                      key={c.label}
                      className="rounded-2xl border border-white/10 p-4 text-white/90 backdrop-blur-xl flex flex-col gap-2"
                      style={{ background: "#0000004D" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md">{c.icon}</span>
                        <span className="text-2xl font-semibold text-white mx-1">{c.value}</span>
                        <span className="text-sm capitalize font-medium text-white/80">{c.label}</span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {c.label === "due soon" ? "in the next 7 days" : "in the last 7 days"}
                      </div>
                    </div>
                  ))}
                </div>
                {/* ...existing code for status, activity, breakdown, etc... */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px]"
                    style={{ background: "#0000004D" }}
                  >
                    <div className="text-lg font-semibold mb-2">Status overview</div>
                    <div className="text-white/70 text-sm mb-6">
                      {taskCounts.totalTask > 0 ? (
                        "Current status overview of all work items in this project"
                      ) : (
                        <>
                          The status overview for this project will display here after you{" "}
                          <span style={{ color: "#0CA9F6" }}>create some work items</span>
                        </>
                      )}
                    </div>
                    <div className="text-center mt-18 text-4xl">{taskCounts.totalTask}</div>
                    <div className="text-center text-white/60 text-sm">Total work items</div>
                  </div>
                  <div
                    className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px]"
                    style={{ background: "#0000004D" }}
                  >
                    <div className="text-lg font-semibold mb-2">Description</div>
                    {project?.description ? (
                      <div className="mt-4 text-white/80">{project.description}</div>
                    ) : (
                      <div className="flex flex-col mt-12 items-center justify-center h-[150px]">
                        <div className="font-medium text-white/60">No description available</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px]"
                    style={{ background: "#0000004D" }}
                  >
                    <div className="text-lg font-semibold mb-2">Priority breakdown</div>
                    <div className="text-white/70 text-sm mb-6">
                      Get a holistic view of how work is being prioritized.{" "}
                      <a
                        href="#"
                        className="text-[#0CA9F6] hover:underline"
                        style={{ color: "#0CA9F6" }}
                      >
                        How to manage priorities for projects
                      </a>
                    </div>
                    <div className="w-full flex justify-center items-center" style={{ minHeight: 300 }}>
                      {/* Unified grid-based chart for clean axis/bar alignment */}
                      <div className="relative w-full max-w-xl" style={{ height: 260 }}>
                        {(() => {
                          // Compute nice tick values and scaling
                          const rawMax = Math.max(
                            taskPriorities.highTask,
                            taskPriorities.mediumTask,
                            taskPriorities.lowTask,
                            0
                          )
                          const paddedMax = Math.max(1, Math.ceil(rawMax * 1.1))
                          const tickCount = 4 // plus 0 at bottom => 5 labels
                          const step = Math.max(1, Math.ceil(paddedMax / tickCount))
                          const topTick = step * tickCount
                          const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => i * step)

                          const chartHeight = 180 // px

                          const scale = (v: number) => (v / topTick) * chartHeight

                          return (
                            <div className="grid grid-cols-[64px_1fr] grid-rows-[180px_auto] gap-x-0 px-4 py-4">
                              {/* Y-axis column */}
                              <div className="relative col-start-1 row-start-1" style={{ height: chartHeight }}>
                                {/* Vertical axis line */}
                                <div
                                  className="absolute top-0 bottom-0 right-0"
                                  style={{ width: 2, background: "#ffffff", borderRadius: 2 }}
                                />
                                {/* Tick labels */}
                                {yTicks.map((t, i) => {
                                  const pos = (t / topTick) * 100 // percentage from bottom
                                  return (
                                    <div
                                      key={`tick-${i}`}
                                      className="absolute text-white/90 text-xs"
                                      style={{
                                        bottom: `${pos}%`,
                                        right: 8,
                                        transform: "translateY(50%)",
                                      }}
                                    >
                                      {t}
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Bars area */}
                              <div
                                className="relative col-start-2 row-start-1 flex items-end justify-around"
                                style={{ height: chartHeight }}
                              >
                                {/* X-axis line (only here) */}
                                <div
                                  className="absolute left-0 right-0 bottom-0"
                                  style={{ height: 2, background: "#ffffff", borderRadius: 2 }}
                                />

                                {[
                                  { priority: "High Task", value: taskPriorities.highTask, color: "#34D399" },
                                  { priority: "Medium Task", value: taskPriorities.mediumTask, color: "#0CA9F6" },
                                  { priority: "Low Task", value: taskPriorities.lowTask, color: "#F472B6" },
                                ].map((bar) => {
                                  const h = Math.max(2, scale(bar.value))
                                  return (
                                    <div key={bar.priority} className="relative group flex flex-col items-center" style={{ width: 64 }}>
                                      {/* Value label */}
                                      <div className="text-white text-sm font-medium mb-1">{bar.value}</div>
                                      <div
                                        className="w-full transition-all duration-300 rounded-t-lg"
                                        style={{ height: h, backgroundColor: bar.color, position: "relative" }}
                                      >
                                        {/* Bar gloss */}
                                        <div className="absolute inset-0">
                                          <div className="w-full h-full bg-gradient-to-t from-white/10 to-transparent rounded-t-lg" />
                                        </div>
                                        {/* Hover tooltip */}
                                        <div
                                          className="absolute opacity-0 group-hover:opacity-100 left-full top-1/2 -translate-y-1/2 ml-2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-opacity z-10"
                                          style={{ whiteSpace: "nowrap" }}
                                        >
                                          {bar.priority}
                                          <br />
                                          <span className="font-semibold">{bar.value} tasks</span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* X-axis labels row aligned with bars */}
                              <div className="col-start-2 row-start-2 mt-2">
                                <div className="flex justify-around text-[13px] font-medium">
                                  <div className="text-center" style={{ color: "#34D399", width: 64 }}>
                                    High Task
                                  </div>
                                  <div className="text-center" style={{ color: "#0CA9F6", width: 64 }}>
                                    Medium Task
                                  </div>
                                  <div className="text-center" style={{ color: "#F472B6", width: 64 }}>
                                    Low Task
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl border border-white/10 p-6 text-white/90 backdrop-blur-xl min-h-[320px] flex flex-col justify-center"
                    style={{ background: "#0000004D" }}
                  >
                    <div className="text-lg font-semibold mb-2">Members Task Breakdown</div>
                    <div className="text-white/70 text-base font-semibold mb-4">Member</div>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      {memberTaskCounts.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/70">No members with tasks found</p>
                        </div>
                      ) : (
                        memberTaskCounts.map((member) => {
                          const taskPercentage = (
                            (parseInt(member.taskCount) / taskCounts.totalTask) *
                            100
                          ).toFixed(0)
                          return (
                            <div
                              key={member.userId}
                              className="bg-[#0000004D] rounded-xl px-4 py-2 flex flex-col gap-1 shadow border border-white/20"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white text-xs font-medium">{member.userName}</span>
                                <span className="text-white/70 text-xs">{member.taskCount} tasks</span>
                              </div>
                              <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                                <div
                                  className="h-3 rounded-full"
                                  style={{
                                    width: `${taskPercentage}%`,
                                    background: "linear-gradient(90deg, #3B82F6 60%, #60A5FA 100%)",
                                    transition: "width 0.4s",
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}