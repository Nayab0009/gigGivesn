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
  MoreHorizontal,
  Plus
} from "lucide-react"
import TimeTable from "./ProjectTimeTable"
import {
  SummaryTab,
  TasksTab,
  CalendarTab,
  MembersTab,
  SettingsTab,
  SprintsTab
} from "./tabs"
import { useProjectContext } from "@/context/ProjectContext"
import { useAuth } from "@/context/AuthContext"

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


  const { activeTab, setActiveTab } = useProjectContext();
  const [taskView, setTaskView] = useState<"table" | "kanban">("table")

  // Settings state
  const [settingsProjectName, setSettingsProjectName] = useState("")
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
  const handleAddSprint = () => {
    router.push(`/projects/${id}/sprints/add`)
  }
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

  // Listen to URL changes for tab updates
  useEffect(() => {
    const handleRouteChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && (tabParam === "summary" || tabParam === "tasks" || tabParam === "sprints" ||
        tabParam === "calendar" || tabParam === "notes" || tabParam === "members" || tabParam === "settings")) {
        setActiveTab(tabParam);
      }
    };

    // Listen to route changes
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // When switching to settings, populate field with current name
  // Update activeTab when URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'sprints' || tab === 'calendar' || tab === 'members' ||
        tab === 'tasks' || tab === 'settings' || tab === 'summary') {
        setActiveTab(tab as any);
      }
    };

    handleUrlChange(); // Check on mount
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

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
    <div className="w-full relative  max-w-full mb-3.5">
      <div className="mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            {/* <div className="text-white/70 text-sm">Project</div> */}
            <h1
              className="text-[20px] font-semibold text-text-main mt-1 mb-8"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 600,
                fontStyle: 'normal',
                lineHeight: '28px',
                letterSpacing: '0px',
                verticalAlign: 'middle',
              }}
            >
              {project ? project.name : isLoading ? "Loading…" : "—"}
            </h1>
          </div>
        </div>

        {/* Tabs + view toggles */}
        <div className="flex items-center justify-between mt-2 mb-6">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-4 ">
              <button className="flex items-center gap-2 text-text-main hover:text-white px-2 py-1 rounded-full transition-all focus:outline-none">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <div
                className="flex  rounded-full p-1 gap-1 shadow-inner [background:var(--container-bg)]"
              
              >
                {[
                  { key: "summary", label: "Summary" },
                  // { key: "tasks", label: "Tasks" },
                  { key: "sprints", label: "Sprints" },
                  { key: "calendar", label: "Calendar" },
                  { key: "members", label: "Members" },
                  // { key: "settings", label: "Settings" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setActiveTab(t.key as any);
                      const url = new URL(window.location.href);
                      url.searchParams.set('tab', t.key);
                      router.replace(url.pathname + url.search);
                    }}
                    className={`  [box-shadow:var(--shadow-combined)] px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${activeTab === t.key
                      ? "bg-[#0000004D] text-text-main shadow "
                      : "text-text-main hover:bg-[#0000004D] border-transparent"
                      }`}
                    style={{ minWidth: 90 }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

            </div>
            {!isAdmin && activeTab === "sprints" && (
              <button
                onClick={() => router.push(`/dashboard/manager/addsprints/${project?.id}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-full transition shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 border"
                style={{
                  backgroundColor: "#0CA9F6",
                  border: "1px solid #57B5E7E5",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Sprint
              </button>
            )}
          </div>

          {activeTab === "tasks" && (
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
          )}
        </div>

        {/* Content */}
        {isLoading && activeTab !== "members" && activeTab !== "settings" ? (
          <div className="p-12 text-center rounded-2xl max-w-xl w-full mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <p className="text-text-main">Loading project…</p>
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
              <>
                <div className="mb-4">
                  <h2
                    className="text-[20px] font-semibold text-white"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      lineHeight: '28px',
                      letterSpacing: '0px',
                      verticalAlign: 'middle',
                      gap: '10px'
                    }}
                  >
                    {project?.name} Calendar
                  </h2>
                </div>
                <CalendarTab projectId={project.id} />
              </>
            ) : activeTab === "sprints" ? (
              <SprintsTab projectId={project.id} projectName={project.name} />
            ) : activeTab === "tasks" ? (
              <TasksTab
                tasks={tasks}
                taskCounts={taskCounts}
                taskView={taskView}
                router={router}
              />
            ) : activeTab === "summary" ? (
              <SummaryTab
                project={project}
                taskCounts={taskCounts}
                taskPriorities={taskPriorities}
                memberTaskCounts={memberTaskCounts}
                statCards={statCards}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}