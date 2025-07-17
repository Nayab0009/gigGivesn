"use client"
import { useEffect, useState } from "react"
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
import { useAuth } from "@/context/AuthContext" // Import your AuthContext
import { colors } from "@/colors"

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` }}>
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
    <div className="min-h-screen pb-12" style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`, color: '#fff' }}>
      {/* Header */}
      <header className="px-6 py-10 rounded-b-3xl shadow-xl mb-8 ml-6 mr-6" style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`, color: '#fff' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#fff' }}>Manager Dashboard</h1>
            <p className="text-sm md:text-base mt-1" style={{ color: '#fff' }}>
              Welcome back, {user?.name || 'Manager'}! Oversee your assigned projects and manage your team effectively
            </p>
          </div>
          <div className="flex gap-4">
         
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-10" style={{ color: '#fff' }}>
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="rounded-2xl shadow-lg p-6 hover:shadow-xl transition border" style={{ background: colors.highlight.hex, borderColor: colors.primary.hex, color: '#fff' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full p-3" style={{ background: colors.secondary.hex, color: '#fff' }}>
                <FolderKanban className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <TrendingUp className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div className="text-3xl font-bold" style={{ color: '#fff' }}>{analytics.totalProjects}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: '#fff' }}>Total Projects</div>
          </div>

          <div className="rounded-2xl shadow-lg p-6 hover:shadow-xl transition border" style={{ background: colors.highlight.hex, borderColor: colors.primary.hex, color: '#fff' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full p-3" style={{ background: colors.secondary.hex, color: '#fff' }}>
                <Target className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <Clock className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div className="text-3xl font-bold" style={{ color: '#fff' }}>{analytics.activeProjects}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: '#fff' }}>Active Projects</div>
          </div>

          <div className="rounded-2xl shadow-lg p-6 hover:shadow-xl transition border" style={{ background: colors.highlight.hex, borderColor: colors.primary.hex, color: '#fff' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full p-3" style={{ background: colors.secondary.hex, color: '#fff' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <Award className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div className="text-3xl font-bold" style={{ color: '#fff' }}>{analytics.completedProjects}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: '#fff' }}>Completed Projects</div>
          </div>

          <div className="rounded-2xl shadow-lg p-6 hover:shadow-xl transition border" style={{ background: colors.highlight.hex, borderColor: colors.primary.hex, color: '#fff' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full p-3" style={{ background: colors.secondary.hex, color: '#fff' }}>
                <Users className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <Star className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div className="text-3xl font-bold" style={{ color: '#fff' }}>{analytics.teamMembers}</div>
            <div className="text-sm mt-1 font-medium" style={{ color: '#fff' }}>Team Members</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10" style={{ color: '#fff' }}>
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#fff' }}>Your Assigned Projects</h2>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: colors.primary.hex }}
              >
                <RefreshCw className="w-4 h-4" style={{ color: colors.primary.hex }} />
                Refresh
              </button>
            </div>
            
            <div className="space-y-6">
              {activeProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: colors.accent.hex }}>
                    <FolderKanban className="w-8 h-8" style={{ color: colors.primary.hex }} />
                  </div>
                  <p className="text-lg font-medium mb-1" style={{ color: colors.primary.hex }}>No Active Projects</p>
                  <p className="text-gray-500">You don't have any active projects assigned yet.</p>
                </div>
              ) : (
                activeProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="rounded-xl shadow-lg hover:shadow-xl transition p-6 border"
                    style={{ background: colors.accent.hex, borderColor: colors.primary.hex }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2" style={{ color: colors.primary.hex }}>
                          {project.name || project.title}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: colors.secondary.hex }}>{project.description}</p>
                        <div className="flex items-center gap-4 text-xs" style={{ color: colors.primary.hex }}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: colors.primary.hex }} />
                            Start: {project.startDate && new Date(project.startDate).toLocaleDateString()}
                          </span>
                          {project.endDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" style={{ color: colors.primary.hex }} />
                              Due: {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          )}
                          {project.budget && (
                            <span>${project.budget.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ background: colors.primary.hex, color: colors.highlight.hex }}
                        >
                          {project.status?.replace('-', ' ')}
                        </span>
                        {project.priority && (
                          <span
                            className="text-xs font-medium px-2 py-1 rounded-md border"
                            style={{ background: colors.highlight.hex, color: colors.warning.hex, borderColor: colors.warning.hex }}
                          >
                            {project.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {(project.progress !== undefined || project.completion !== undefined) && (
                      <div>
                        <div className="flex justify-between text-sm mb-2" style={{ color: colors.primary.hex }}>
                          <span>Progress</span>
                          <span className="font-medium" style={{ color: colors.primary.hex }}>
                            {project.progress || project.completion || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-white/60 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress || project.completion || 0}%`, background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Team Performance */}
            <div className="rounded-2xl shadow-lg px-6 py-8 border" style={{ background: colors.highlight.hex, borderColor: colors.primary.hex }}>
              <h3 className="font-bold text-lg mb-4" style={{ color: colors.primary.hex }}>Team Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.primary.hex }}>Total Tasks Completed</span>
                  <span className="font-bold" style={{ color: colors.primary.hex }}>{analytics.totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.primary.hex }}>Average Rating</span>
                  <span className="font-bold flex items-center gap-1" style={{ color: colors.warning.hex }}>
                    <Star className="w-4 h-4 fill-current" style={{ color: colors.warning.hex }} />
                    {analytics.avgTeamRating}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: colors.primary.hex }}>Active Members</span>
                  <span className="font-bold" style={{ color: colors.primary.hex }}>
                    {teamMembers.filter((m) => m.status === "online").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Team Activity */}
            <div className="rounded-2xl shadow-lg px-6 py-8 border" style={{ background: colors.accent.hex, borderColor: colors.primary.hex }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ color: colors.primary.hex }}>Team Members</h3>
                <a href="#" className="text-xs font-medium hover:underline" style={{ color: colors.primary.hex }}>
                  View all
                </a>
              </div>
              <div className="space-y-4">
                {teamMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: colors.primary.hex, color: colors.highlight.hex }}>
                        {member.avatar}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: member.status === 'online' ? colors.primary.hex : member.status === 'away' ? colors.warning.hex : '#ccc' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: colors.primary.hex }}>{member.name}</div>
                      <div className="text-xs truncate" style={{ color: colors.secondary.hex }}>{member.role}</div>
                    </div>
                    <div className="text-xs font-medium" style={{ color: colors.primary.hex }}>{member.tasksCompleted} tasks</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl shadow-lg px-6 py-7" style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`, color: colors.highlight.hex }}>
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2" style={{ color: colors.highlight.hex }}>
                  <MessageSquare className="h-4 w-4" style={{ color: colors.highlight.hex }} />
                  <span className="text-sm">Team Meeting</span>
                </button>
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2" style={{ color: colors.highlight.hex }}>
                  <BarChart2 className="h-4 w-4" style={{ color: colors.highlight.hex }} />
                  <span className="text-sm">View Reports</span>
                </button>
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2" style={{ color: colors.highlight.hex }}>
                  <Settings className="h-4 w-4" style={{ color: colors.highlight.hex }} />
                  <span className="text-sm">Project Settings</span>
                </button>
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2" style={{ color: colors.highlight.hex }}>
                  <Calendar className="h-4 w-4" style={{ color: colors.highlight.hex }} />
                  <span className="text-sm">Schedule Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}