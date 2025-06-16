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
} from "lucide-react"

// Static demo data
const staticProjects = [
  {
    id: 1,
    title: "Mobile App Redesign",
    status: "Active",
    description: "Complete UI/UX overhaul of the mobile application with modern design principles",
    startDate: "2024-03-15",
    endDate: "2024-07-30",
    progress: 65,
    priority: "High",
    teamSize: 4,
    cardBg: "bg-gradient-to-br from-emerald-50 to-green-100",
  },
  {
    id: 2,
    title: "E-commerce Integration",
    status: "Active",
    description: "Integrate payment gateway and shopping cart functionality",
    startDate: "2024-04-01",
    endDate: "2024-06-15",
    progress: 80,
    priority: "Medium",
    teamSize: 3,
    cardBg: "bg-gradient-to-br from-blue-50 to-cyan-100",
  },
  {
    id: 3,
    title: "Customer Dashboard",
    status: "Completed",
    description: "Build comprehensive customer analytics and reporting dashboard",
    startDate: "2024-01-10",
    endDate: "2024-03-20",
    progress: 100,
    priority: "High",
    teamSize: 5,
    cardBg: "bg-gradient-to-br from-teal-50 to-emerald-100",
  },
  {
    id: 4,
    title: "API Documentation",
    status: "Active",
    description: "Create comprehensive API documentation for external developers",
    startDate: "2024-05-01",
    endDate: "2024-06-30",
    progress: 45,
    priority: "Low",
    teamSize: 2,
    cardBg: "bg-gradient-to-br from-purple-50 to-indigo-100",
  },
  {
    id: 5,
    title: "Security Audit",
    status: "Pending",
    description: "Complete security assessment and implementation of fixes",
    startDate: "2024-06-01",
    endDate: "2024-08-15",
    progress: 20,
    priority: "High",
    teamSize: 3,
    cardBg: "bg-gradient-to-br from-orange-50 to-red-100",
  },
  {
    id: 6,
    title: "Marketing Website",
    status: "Completed",
    description: "Develop new marketing website with SEO optimization",
    startDate: "2024-02-01",
    endDate: "2024-04-10",
    progress: 100,
    priority: "Medium",
    teamSize: 4,
    cardBg: "bg-gradient-to-br from-violet-50 to-purple-100",
  },
]

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
  title: string
  status: string
  description?: string
  startDate?: string
  endDate?: string
  progress?: number
  priority?: string
  teamSize?: number
  cardBg?: string
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
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    teamMembers: 0,
    totalTasks: 0,
    avgTeamRating: "0.0",
  })

  useEffect(() => {
    // Simulate loading and set static data
    setTimeout(() => {
      setProjects(staticProjects)
      setTeamMembers(staticTeamMembers)
      const totalTasks = staticTeamMembers.reduce((sum, member) => sum + (member.tasksCompleted || 0), 0)
      setAnalytics({
        totalProjects: staticProjects.length,
        activeProjects: staticProjects.filter((p) => p.status === "Active").length,
        completedProjects: staticProjects.filter((p) => p.status === "Completed").length,
        teamMembers: staticTeamMembers.length,
        totalTasks,
        avgTeamRating: "4.6",
      })
    }, 500)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500 text-white"
      case "Completed":
        return "bg-teal-500 text-white"
      case "Pending":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Low":
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-10 rounded-b-3xl shadow-xl mb-8 ml-6 mr-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manager Dashboard</h1>
            <p className="text-emerald-200 text-sm md:text-base mt-1">
              Oversee projects and manage your team effectively
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2 bg-white text-emerald-700 rounded-xl font-semibold shadow hover:bg-emerald-50 transition">
              <Plus className="h-5 w-5" /> New Project
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-500 rounded-xl font-semibold shadow hover:bg-emerald-600 transition">
              <UserPlus className="h-5 w-5" /> Add Member
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-10">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-200 text-emerald-800 rounded-full p-3">
                <FolderKanban className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Total Projects</div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal-200 text-teal-800 rounded-full p-3">
                <Target className="w-6 h-6" />
              </div>
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.activeProjects}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Active Projects</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-200 text-blue-800 rounded-full p-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.completedProjects}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Completed Projects</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-200 text-purple-800 rounded-full p-3">
                <Users className="w-6 h-6" />
              </div>
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics.teamMembers}</div>
            <div className="text-gray-600 text-sm mt-1 font-medium">Team Members</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Projects</h2>
              <a href="#" className="text-emerald-600 hover:underline text-sm font-medium">
                View all projects
              </a>
            </div>
            <div className="space-y-6">
              {projects
                .filter((p) => p.status === "Active")
                .map((project) => (
                  <div
                    key={project.id}
                    className={`${project.cardBg} rounded-xl shadow-lg hover:shadow-xl transition p-6 border border-white/50`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{project.title}</h3>
                        <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {project.endDate && new Date(project.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.teamSize} members
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}
                        >
                          {project.status}
                        </span>
                        {project.priority && (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-md border ${getPriorityColor(project.priority)}`}
                          >
                            {project.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    {project.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700">Progress</span>
                          <span className="font-medium text-gray-800">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-white/60 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Team Performance */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl shadow-lg px-6 py-8 border border-white/50">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Team Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Total Tasks Completed</span>
                  <span className="font-bold text-emerald-600">{analytics.totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Average Rating</span>
                  <span className="font-bold text-yellow-600 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    {analytics.avgTeamRating}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Active Members</span>
                  <span className="font-bold text-emerald-600">
                    {teamMembers.filter((m) => m.status === "online").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Team Activity */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-lg px-6 py-8 border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Team Members</h3>
                <a href="#" className="text-emerald-600 text-xs font-medium hover:underline">
                  View all
                </a>
              </div>
              <div className="space-y-4">
                {teamMembers.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusDot(member.status)} rounded-full border-2 border-white`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{member.name}</div>
                      <div className="text-xs text-gray-600 truncate">{member.role}</div>
                    </div>
                    <div className="text-xs text-emerald-600 font-medium">{member.tasksCompleted} tasks</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-lg px-6 py-7 text-white">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Team Meeting</span>
                </button>
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-sm">View Reports</span>
                </button>
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Project Settings</span>
                </button>
                <button className="w-full text-left hover:bg-white/10 rounded-lg p-2 transition flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
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
