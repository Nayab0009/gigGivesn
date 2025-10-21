"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getProjectTeam,
  getProjectTasks,
  getProjectTaskCounts,
  getProjectMemberTaskCounts,
  type MemberTaskCount,
  type ProjectTask,
} from "@/lib/ProjectService"
import { AlertCircle, Filter, RefreshCw } from "lucide-react"
import { CalendarTab, MembersTab } from "@/components/projects/tabs"
import EmployeeSprintsTab from "@/components/employeeDashboard/EmployeeSprintsTab"
import { useEmployeeContext } from "@/context/EmployeeContext"

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

export default function EmployeeProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [membersLoading, setMembersLoading] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [taskCounts, setTaskCounts] = useState({
    totalTask: 0,
    inProgressTask: 0,
    completedTask: 0,
    cancelledTask: 0,
  })
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const { activeTab, setActiveTab } = useEmployeeContext()


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
        const [countsResponse, memberTasksResponse, projectTasks] = await Promise.all([
          getProjectTaskCounts(id),
          getProjectMemberTaskCounts(id),
          getProjectTasks(id),
        ])
        setTaskCounts(countsResponse)
        // memberTasksResponse can be used later if needed
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
  }, [id, activeTab])

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

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get("tab")
      if (tab === "sprints" || tab === "calendar" || tab === "members") {
        setActiveTab(tab as any)
      }
    }
    handleUrlChange()
    window.addEventListener("popstate", handleUrlChange)
    return () => {
      window.removeEventListener("popstate", handleUrlChange)
    }
  }, [])

  return (
    <div className="fixed top-[150px] left-1/2 transform -translate-x-1/2 w-[96%] h-[calc(100vh-160px)] overflow-y-auto hide-scrollbar">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-white/70 text-sm">Project</div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
              {project ? project.name : isLoading ? "Loading…" : "—"}
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 mb-6">
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-2 text-white hover:text-white px-2 py-1 rounded-full transition-all focus:outline-none ">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
            <div
              className="flex  rounded-full p-1 gap-1 shadow-inner"
              style={{ background: "#0000004D" }}
            >
              {[
                { key: "sprints", label: "Sprints" },
                { key: "calendar", label: "Calendar" },
                { key: "members", label: "Members" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveTab(t.key as any)
                    const url = new URL(window.location.href)
                    url.searchParams.set("tab", t.key)
                    router.replace(url.pathname + url.search)

                  }}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none ${activeTab === (t.key as any)
                    ? "bg-[#0000004D] text-white shadow "
                    : "text-white/80 hover:text-white hover:bg-white/10 "
                    }`}
                  style={{ minWidth: 90 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading && activeTab !== "members" ? (
          <div
            className="p-12 text-center border border-white/10 rounded-2xl max-w-xl w-full mx-auto"
            style={{ background: "#0000004D" }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
            <p className="text-white/80">Loading project…</p>
          </div>
        ) : error && activeTab !== "members" ? (
          <div
            className="p-6 border border-red-200/40 rounded-2xl text-white max-w-xl w-full mx-auto"
            style={{ background: "#0000004D" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-red-300" />
              <div className="font-semibold">Error loading project</div>
            </div>
            <div className="text-white/80 text-sm">{error}</div>
          </div>
        ) : activeTab === "members" ? (
          <MembersTab project={project} membersLoading={membersLoading} members={members} />
        ) : project ? (
          <div className="space-y-6">
            {activeTab === "calendar" ? (
              <CalendarTab projectId={project.id} />
            ) : activeTab === "sprints" ? (
              <EmployeeSprintsTab projectId={project.id} projectName={project.name} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
