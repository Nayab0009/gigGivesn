"use client"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShowEmployee } from "@/lib/TeamService"
import { sendMessage as fetchChatHistoryAPI } from "@/lib/chatService"
import {
  Users,
  BarChart2,
  UserPlus,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  FolderKanban,
  Star,
  MessageSquare,
  Settings,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import axiosInstance from "@/lib/axios"
import { useAuth } from "@/context/AuthContext" 
import { colors } from "@/colors"

import TimeTable from "./TimeTable"
import { getAllTasks } from "@/lib/TaskService"

// Static team members data (you can replace with API call later)
const staticTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1-555-0123",
    role: "Senior Developer",
    avatar: "SJ",
    status: "online",
    tasksCompleted: 24,
    currentProject: "Mobile App Redesign",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1-555-0124",
    role: "UI/UX Designer",
    avatar: "MC",
    status: "online",
    tasksCompleted: 18,
    currentProject: "E-commerce Integration",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    phone: "+1-555-0125",
    role: "Project Manager",
    avatar: "ER",
    status: "away",
    tasksCompleted: 31,
    currentProject: "Customer Dashboard",
  },
  {
    id: 4,
    name: "David Thompson",
    email: "david.thompson@company.com",
    phone: "+1-555-0126",
    role: "Backend Developer",
    avatar: "DT",
    status: "online",
    tasksCompleted: 22,
    currentProject: "API Documentation",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    phone: "+1-555-0127",
    role: "QA Engineer",
    avatar: "LW",
    status: "offline",
    tasksCompleted: 15,
    currentProject: "Security Audit",
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james.wilson@company.com",
    phone: "+1-555-0128",
    role: "DevOps Engineer",
    avatar: "JW",
    status: "online",
    tasksCompleted: 19,
    currentProject: "Marketing Website",
  },
]

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
  // Fetch first 3 tasks for Today Task section
  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true)
      try {
        const data = await getAllTasks()
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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
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

  // Set team members (using static data for now)
  useEffect(() => {
    setTeamMembers(staticTeamMembers)
    const totalTasks = staticTeamMembers.reduce((sum, member) => sum + (member.tasksCompleted || 0), 0)
    setAnalytics(prev => ({
      ...prev,
      teamMembers: staticTeamMembers.length,
      totalTasks,
      avgTeamRating: "4.6",
    }))
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in-progress":
        return "bg-emerald-500 text-white"
      case "completed":
        return "bg-teal-500 text-white"
      case "pending":
      case "planning":
        return "bg-yellow-500 text-white"
      case "on-hold":
      case "blocked":
        return "bg-orange-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-400"
      case "away":
        return "bg-yellow-400"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getCardBackground = (index: number) => {
    const backgrounds = [
      "bg-gradient-to-br from-emerald-50 to-green-100",
      "bg-gradient-to-br from-blue-50 to-cyan-100",
      "bg-gradient-to-br from-teal-50 to-emerald-100",
      "bg-gradient-to-br from-purple-50 to-indigo-100",
      "bg-gradient-to-br from-orange-50 to-red-100",
      "bg-gradient-to-br from-violet-50 to-purple-100",
    ]
    return backgrounds[index % backgrounds.length]
  }

  // Filter active projects
  const activeProjects = projects.filter((p) =>
    p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'in-progress'
  )

  // Sort todayTasks by priority: High > Medium > Low > others
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    const pa = priorityOrder[String(a.priority).toLowerCase()] || 99;
    const pb = priorityOrder[String(b.priority).toLowerCase()] || 99;
    if (pa !== pb) return pa - pb;
    return 0;
  });

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
    <div className="min-h-screen pb-12 bg-black/40 backdrop-blur-md text-white rounded-2xl">
      {/* Header */}
      <header className="px-6 py-10 rounded-b-3xl  mb-8 ml-6 mr-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
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

      {/* Today Task Section - new modern cards */}
   
<div className="max-w-7xl mx-auto px-6 mb-10">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    

    {/* Today Task Section - take 3 columns */}
    <div className="lg:col-span-3">
      <div className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(60,120,180,0.10) 100%)',
          border: '1.5px solid rgba(255,255,255,0.13)',
          boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg md:text-xl font-bold tracking-tight">Today Task</h4>
          {/* <button
            className="text-sm font-medium text-blue-300 hover:underline focus:outline-none"
            onClick={() => router.push('/dashboard/manager/tasks')}
          >
            See All
          </button> */}
        </div>
        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasksLoading ? (
            <div className="col-span-3 text-center text-blue-200 py-8">Loading...</div>
          ) : todayTasks.length === 0 ? (
            <div className="col-span-3 text-center text-blue-200 py-8">No tasks found.</div>
          ) : (
            sortedTodayTasks.map((task, idx) => (
              <div key={task.id || idx} className="rounded-xl border border-blue-200/30 p-6 bg-black/30 flex flex-col justify-between min-h-[160px]">
                <span className="text-xs font-semibold text-blue-400 mb-2">{task.priority || 'Task'}</span>
                <div className="font-bold text-lg mb-3">{task.title || task.name || 'Untitled Task'}</div>
                <div className="flex items-center mb-4">
                  {/* Optionally show assigned users/avatars if available */}
                  {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                     task.assignees.slice(0, 3).map((assignee: any, i: number) => (
                      <img
                        key={assignee.id || i}
                        src={assignee.avatar || '/avatars/u1.png'}
                        className={`w-7 h-7 rounded-full border-2 border-white ${i > 0 ? '-ml-2' : '-ml-1'}`}
                        alt={assignee.name || ''}
                      />
                    ))
                  ) : (
                    <img src="/avatars/u1.png" className="w-7 h-7 rounded-full border-2 border-white -ml-1" alt="" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-24 h-2 bg-blue-900 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-400 rounded-full" style={{ width: `${task.progress || 0}%` }}></div>
                  </div>
                  <span className="text-xs text-blue-300 font-semibold ml-2">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Project Status Card - takes 1 column */}
    <div>
      <div
        className="rounded-xl p-5 flex flex-col justify-between border border-blue-200/30 
                   bg-gradient-to-br from-[#18323b] to-[#1a2a3a] shadow-md w-[320px]"
        style={{
          minHeight: '150px',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-2"> 
          <span className="text-lg font-semibold text-white">Project Completed</span>
          <span className="text-xs font-medium text-blue-300">
            Total projects {analytics.totalProjects}
          </span>
        </div>

      {/* add comment */}
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

          {/* Donut chart */}
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
    </div>

  </div>
</div>
  
  

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-10">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start" style={{ color: '#fff' }}>

         
        
          <div className="lg:col-span-2">

            <div className="space-y-6">
               <TimeTable />
              </div>
          </div>

          {/* Right Sidebar */}
         <div className="space-y-6">
          {/* Communication Logs */}
          <div
            className="rounded-xl p-5 flex flex-col justify-between border border-blue-200/30 
                      bg-gradient-to-br from-[#18323b] to-[#1a2a3a] shadow-md 
                      w-[420px]"
            style={{
              minHeight: '300px',
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
              transition: 'box-shadow 0.2s',
            }}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-white">Communication Logs</span>
              <button
                className="text-xs font-medium text-blue-300 hover:underline focus:outline-none"
                onClick={() => router.push('/dashboard/manager/chat')}
              >
                See All
              </button>
            </div>

            {/* Logs list */}
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
                        <span className="text-xs text-blue-300">{log.lastMessage}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-2 rounded-full bg-black/30 hover:bg-black/50">📞</button>
                      <button className="p-2 rounded-full bg-black/30 hover:bg-black/50">🎥</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
   
  )
}