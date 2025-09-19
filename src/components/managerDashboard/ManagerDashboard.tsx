"use client"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShowEmployee } from "@/lib/TeamService"
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService"
import {
  
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import axiosInstance from "@/lib/axios"
import { useAuth } from "@/context/AuthContext" 
import { colors } from "@/colors"

import TimeTable from "./TimeTable"
import { getManagerTasksToday } from "@/lib/TaskService"
import Link from "next/link"
import TodayTask from "./TodayTask"


interface Project {
  id: number | string
  name?: string
  title?: string
  status: string
  description?: string
  startDate?: string
  endDate?: string
  progress?: number
  completion?: number
  priority?: string
  teamSize?: number
  cardBg?: string
  manager?: any
  budget?: number
}

interface TeamMember {
  id: number | string
  name: string
  email: string
  phone: string
  role?: string
  avatar?: string
  status?: string
  tasksCompleted?: number
  currentProject?: string
}

interface AnalyticsData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  teamMembers: number
  totalTasks: number
  avgTeamRating: string
}

export default function ManagerDashboard() {
  // Today Task State
  const [todayTasks, setTodayTasks] = useState<any[]>([]) // Removed duplicate declaration
  const [tasksLoading, setTasksLoading] = useState(false)



  //for popup opening
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // Fetch first 3 tasks for Today Task section
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true)
      try {
        const data = await getManagerTasksToday()
        const priorityBuckets: Record<string, any[]> = { high: [], medium: [], low: [], other: [] }
        if (Array.isArray(data)) {
          data.forEach(task => {
            const p = String(task.priority || '').toLowerCase()
            if (p === 'high') priorityBuckets.high.push(task)
            else if (p === 'medium') priorityBuckets.medium.push(task)
            else if (p === 'low') priorityBuckets.low.push(task)
            else priorityBuckets.other.push(task)
          })
        }
        // Pick one from each bucket in order: high, medium, low, then fill with others if needed
        const result: any[] = []
        if (priorityBuckets.high.length) result.push(priorityBuckets.high[0])
        if (priorityBuckets.medium.length) result.push(priorityBuckets.medium[0])
        if (priorityBuckets.low.length) result.push(priorityBuckets.low[0])
        // Fill up to 3 with remaining tasks (from any bucket, skipping already picked)
        const usedIds = new Set(result.map(t => t.id))
        const allRemaining = [...priorityBuckets.high.slice(1), ...priorityBuckets.medium.slice(1), ...priorityBuckets.low.slice(1), ...priorityBuckets.other]
        for (const t of allRemaining) {
          if (result.length >= 3) break
          if (!usedIds.has(t.id)) result.push(t)
        }
        setTodayTasks(result)
      } catch {
        setTodayTasks([])
      } finally {
        setTasksLoading(false)
      }
    }
    fetchTasks()
  }, [])


  const { user } = useAuth() // Get logged-in manager info
  const [projects, setProjects] = useState<Project[]>([])
  // const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
    totalTasks: 0,
    avgTeamRating: "0.0",
  })

  // Communication Logs State
  const [commLogs, setCommLogs] = useState<any[]>([])
  const [commLoading, setCommLoading] = useState(false)
  const router = useRouter()
  // Fetch first 4 chat contacts/messages for Communication Logs
  useEffect(() => {
    const fetchCommLogs = async () => {
      if (!user?.id || !user?.role) return
      setCommLoading(true)
      try {
        // Get opposite role for chat contacts
        const contactRole = user.role === "manager" ? "employee" : "manager"
        const response = await ShowEmployee(contactRole)
        const contacts = (response?.data || []).slice(0, 4)
        // For each contact, fetch last message
        const logs = await Promise.all(
          contacts.map(async (contact: any) => {
            let lastMsg = null
            try {
              const data = await fetchChatHistoryAPI(user.id.toString(), contact.id.toString())
              const arr = Array.isArray(data) ? data : data.messages || []
              if (arr.length > 0) {
                const msg = arr[arr.length - 1]
                lastMsg = typeof msg.messageBody === "string" && msg.messageBody.startsWith("http")
                  ? "File"
                  : msg.messageBody || "Voice Message"
              }
            } catch {}
            return {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatar || undefined,
              lastMessage: lastMsg || "Voice Message",
            }
          })
        )
        setCommLogs(logs)
      } catch (e) {
        setCommLogs([])
      } finally {
        setCommLoading(false)
      }
    }
    fetchCommLogs()
  }, [user?.id, user?.role])

  // Fetch projects assigned to the manager
  useEffect(() => {
    const fetchManagerProjects = async () => {
      if (!user?.id) return

      setIsLoading(true)
      setError(null)

      try {
        console.log('Fetching projects for manager:', user.id)
        const response = await axiosInstance.get('/projects/manager/all')
        console.log('API Response:', response.data)

        const projectsData = Array.isArray(response.data) ? response.data : []
        setProjects(projectsData)

        // Calculate analytics from fetched projects
        const totalProjects = projectsData.length
        const activeProjects = projectsData.filter((p: Project) =>
          p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'in-progress'
        ).length
        const completedProjects = projectsData.filter((p: Project) =>
          p.status?.toLowerCase() === 'completed'
        ).length

        setAnalytics(prev => ({
          ...prev,
          totalProjects,
          activeProjects,
          completedProjects,
        }))

      } catch (error) {
        console.error("Error fetching manager projects:", error)
        setError("Failed to load projects. Please try again.")
        setProjects([])

      } finally {
        setIsLoading(false)
      }
    }

    fetchManagerProjects()
  }, [user?.id])

  

  // Sort todayTasks by priority: High > Medium > Low > others
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    const pa = priorityOrder[String(a.priority).toLowerCase()] || 99;
    const pb = priorityOrder[String(b.priority).toLowerCase()] || 99;
    if (pa !== pb) return pa - pb;
    return 0;
  });



  const highCount = todayTasks.filter(t => t.priority?.toLowerCase() === "high").length
  const mediumCount = todayTasks.filter(t => t.priority?.toLowerCase() === "medium").length
  const lowCount = todayTasks.filter(t => t.priority?.toLowerCase() === "low").length
  const totalCount = todayTasks.length || 1


  //handle view all click
  const handleViewAllClick = () => {
    setIsPopupOpen(true);
    
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: colors.accent.hex }}>
            <RefreshCw className="w-8 h-8" style={{ color: colors.primary.hex }} />
          </div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }




  return (
    <div className="min-h-screen pb-12  text-white rounded-2xl">
      {/* Header */}
      <header className="px-6 py-10 rounded-b-3xl  mb-8 ml-6 mr-6">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manager Dashboard</h1>
            <p className="text-sm md:text-base mt-1">
              Welcome back, {user?.name || 'Manager'}! Oversee your assigned projects and manage your team effectively
            </p>
          </div>
        </div>
      </header>

      {/* Error Message */}
      <div className="max-w-7xl mx-auto px-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>

    
{/* Today Task Section */}
      <div className="mx-auto px-6 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Today Task + Timetable */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div
              className="rounded-2xl p-4 bg-black/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg md:text-xl font-bold tracking-tight">Today Task</h4>
                <button className="text-sm text-blue-400 hover:text-blue-300"
                  onClick={handleViewAllClick}>
                  See All
                </button>
              </div>
              {/* Task Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                {tasksLoading ? (
                  <div className="col-span-3 text-center text-blue-200 py-8">Loading...</div>
                ) : todayTasks.length === 0 ? (
                  <div className="col-span-3 text-center text-blue-200 py-8">
                    No tasks found.
                  </div>
                ) : (
                  sortedTodayTasks.map((task, idx) => {
                    const priorityLabel = task.priority
                      ? `${task.priority} Priority`
                      : "Task"
                    const priorityColorClass = "text-blue-400"

                    const assignedUsers = [task.taskFor].filter(Boolean)
                    if (
                      task.createdBy &&
                      !assignedUsers.find(u => u.id === task.createdBy.id)
                    ) {
                      assignedUsers.push(task.createdBy)
                    }

                    let completed = 0
                    if (task.priority?.toLowerCase() === "high") {
                      completed = highCount
                    } else if (task.priority?.toLowerCase() === "medium") {
                      completed = mediumCount
                    } else if (task.priority?.toLowerCase() === "low") {
                      completed = lowCount
                    }

                    return (
                      <div
                        key={task.id || idx}
                        className="rounded-xl p-6 bg-black/30 flex flex-col justify-between min-h-[160px]"

                      >
                        {/* Priority Label */}
                        <div className={`text-xs font-medium mb-2 ${priorityColorClass}`}>
                          {priorityLabel}
                        </div>

                        {/* Task Title */}
                        <div className="font-bold text-lg text-white mb-4">
                          {task.title || task.name || "Untitled Task"}
                        </div>

                        {/* User Avatars */}
                        <div className="flex -space-x-2 mb-4">
                          {assignedUsers.map((user, i) => (
                            <div key={user?.id || i} className="relative">
                              {user?.avatar ? (
                                <img
                                  src={user.avatar}
                                  className="w-8 h-8 rounded-full border-2 border-black object-cover"
                                  alt={user.name || ""}
                                  title={user.name || ""}
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-black bg-blue-600 text-white flex items-center justify-center text-xs"
                                  title={user?.name || ""}
                                >
                                  {user?.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center justify-between">
                          <div className="w-24 h-1 bg-gray-700 rounded-full">
                            <div
                              className="h-1 rounded-full bg-blue-400"
                              style={{
                                width:
                                  totalCount > 0
                                    ? `${(completed / totalCount) * 100}%`
                                    : "0%",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-blue-400">
                            {completed}/{totalCount}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

                          
      {/* Timetable directly below Today Task */}
      <div
        className="rounded-2xl border border-blue-200/30 bg-black/30 overflow-auto scrollbar-none"
        style={{ minHeight: '300px', maxHeight: '420px',scrollbarWidth: 'none' }}
      >
        <TimeTable />
      </div>
    </div>

    {/* Right column: Project Status + Communication Logs stacked */}
    <div className="flex flex-col gap-6 w-full">
      {/* Project Status Card */}
      <div
        className="rounded-xl p-5 flex flex-col justify-between border border-blue-200/30 
                   bg-black/30 shadow-md w-full min-w-[280px] max-w-[340px] mx-auto"

      >
        <div className="flex items-center justify-between mb-2"> 
          <span className="text-lg font-semibold text-white">Project Completed</span>
          <span className="text-xs font-medium text-blue-300">
            Total projects {analytics.totalProjects}
          </span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex flex-col gap-2 ml-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#8b5cf6' }}></span>
              <span className="text-xs text-white">Project Done <span className="font-bold">{analytics.completedProjects}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }}></span>
              <span className="text-xs text-white">In Progress <span className="font-bold">{analytics.activeProjects}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#38bdf8' }}></span>
              <span className="text-xs text-white">Backlog <span className="font-bold">{analytics.totalProjects - analytics.completedProjects - analytics.activeProjects}</span></span>
            </div>
          </div>
          <svg width="180" height="180" viewBox="0 0 36 36" className="mr-2">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="white" strokeWidth="3.5" />
            {/* Completed */}
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeDasharray={`${analytics.completedProjects / (analytics.totalProjects || 1) * 100},100`} strokeDashoffset="25" />
            {/* Active */}
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#fbbf24" strokeWidth="3.5" strokeDasharray={`${analytics.activeProjects / (analytics.totalProjects || 1) * 100},100`} strokeDashoffset="75" />
            {/* Backlog */}
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray={`${(analytics.totalProjects - analytics.completedProjects - analytics.activeProjects) / (analytics.totalProjects || 1) * 100},100`} strokeDashoffset="100" />
          </svg>
        </div>
      </div>
      {/* Communication Logs Card */}
      <div
        className="rounded-xl p-5 flex flex-col justify-between border border-blue-200/30 
                  bg-black/30 shadow-md w-full min-w-[280px] max-w-[340px] mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Communication Logs</span>
          <button
            className="text-xs font-medium text-blue-300 hover:underline focus:outline-none"
            onClick={() => router.push('/dashboard/manager/chat')}
          >
            See All
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {commLoading ? (
            <div className="text-center text-blue-200 py-8">Loading...</div>
          ) : commLogs.length === 0 ? (
            <div className="text-center text-blue-200 py-8">No communication logs found.</div>
          ) : (
            commLogs.map((log, idx) => (
              <div key={log.id || idx} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900 text-white font-bold text-lg">
                    {log.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{log.name}</span>
                      <span className="text-xs text-blue-300 truncate max-w-[120px]" title={log.lastMessage}>
                      {log.lastMessage && log.lastMessage.length > 10
                        ? log.lastMessage.slice(0, 10) + '...'
                        : log.lastMessage}
                </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white">📞</button>
                  <button className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white">🎥</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

  </div>
</div>
  
  {isPopupOpen && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setIsPopupOpen(false)}
    >
      <div
        className="rounded-2xl p-6 max-w-5xl w-full mx-4 relative"
        onClick={e => e.stopPropagation()}
      >
        <TodayTask />
      </div>
    </div>
  )}
  </div>

                
  )
}