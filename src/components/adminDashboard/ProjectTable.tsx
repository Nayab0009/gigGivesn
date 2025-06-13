"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Calendar,
  TrendingUp,
  Users,
  ClipboardCheck,
  X,
  Check,
  AlertCircle,
  Filter,
  ChevronDown,
  UserCheck,
} from "lucide-react"

// --- Enhanced Types ---
interface User {
  id: string
  name: string
  avatar: string
  role: string
  email: string
  status: "active" | "busy" | "offline"
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string[]
  status: "pending" | "in-progress" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "critical"
  dueDate: string
  estimatedHours: number
}

interface Team {
  id: string
  name: string
  members: User[]
  lead: string
  department: string
}

interface Project {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  budget: number
  completion: number
  team?: Team
  tasks: Task[]
}

const generateAvatar = (name: string, index: number) => {
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  ]
  return avatarStyles[index % avatarStyles.length]
}

// Enhanced Mock Data
const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Frontend Development",
    department: "Engineering",
    lead: "user-1",
    members: [
      {
        id: "user-1",
        name: "Sarah Chen",
        role: "Frontend Lead",
        email: "sarah.chen@company.com",
        avatar: generateAvatar("Sarah Chen", 0),
        status: "active",
      },
      {
        id: "user-2",
        name: "Mike Rodriguez",
        role: "React Developer",
        email: "mike.rodriguez@company.com",
        avatar: generateAvatar("Mike Rodriguez", 1),
        status: "active",
      },
      {
        id: "user-3",
        name: "Emma Watson",
        role: "UI/UX Designer",
        email: "emma.watson@company.com",
        avatar: generateAvatar("Emma Watson", 2),
        status: "busy",
      },
    ],
  },
  {
    id: "team-2",
    name: "Backend Development",
    department: "Engineering",
    lead: "user-4",
    members: [
      {
        id: "user-4",
        name: "Lisa Park",
        role: "Backend Lead",
        email: "lisa.park@company.com",
        avatar: generateAvatar("Lisa Park", 3),
        status: "active",
      },
      {
        id: "user-5",
        name: "David Kim",
        role: "Node.js Developer",
        email: "david.kim@company.com",
        avatar: generateAvatar("David Kim", 4),
        status: "active",
      },
      {
        id: "user-6",
        name: "Alex Johnson",
        role: "DevOps Engineer",
        email: "alex.johnson@company.com",
        avatar: generateAvatar("Alex Johnson", 5),
        status: "offline",
      },
    ],
  },
  {
    id: "team-3",
    name: "Quality Assurance",
    department: "QA",
    lead: "user-7",
    members: [
      {
        id: "user-7",
        name: "Jessica Brown",
        role: "QA Lead",
        email: "jessica.brown@company.com",
        avatar: generateAvatar("Jessica Brown", 6),
        status: "active",
      },
      {
        id: "user-8",
        name: "Tom Wilson",
        role: "Test Engineer",
        email: "tom.wilson@company.com",
        avatar: generateAvatar("Tom Wilson", 7),
        status: "busy",
      },
    ],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
    case "in-progress":
      return "bg-green-100 text-green-800 border-green-200"
    case "planning":
    case "pending":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "on-hold":
    case "blocked":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getUserStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <div className="w-2 h-2 bg-green-400 rounded-full"></div>
    case "busy":
      return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
    case "offline":
      return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
  }
}

export default function ProfessionalProjectDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assignTeamProjectId, setAssignTeamProjectId] = useState<string | null>(null)
  const [assignTaskProjectId, setAssignTaskProjectId] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: [] as string[],
    priority: "medium" as Task["priority"],
    dueDate: "",
    estimatedHours: 0,
  })

  // Assign team to project
  const assignTeam = (projectId: string, team: Team) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, team } : p)))
    setAssignTeamProjectId(null)
  }

  // Add task to project
  const addTaskToProject = (projectId: string) => {
    if (!newTask.title.trim() || newTask.assignedTo.length === 0) return

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      status: "pending",
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours,
    }

    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p)))

    // Reset form
    setNewTask({
      title: "",
      description: "",
      assignedTo: [],
      priority: "medium",
      dueDate: "",
      estimatedHours: 0,
    })
    setAssignTaskProjectId(null)
  }

  // Toggle task assignment
  const toggleTaskAssignment = (userId: string) => {
    setNewTask((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }))
  }

  useEffect(() => {
    setTimeout(() => {
      setProjects([
        {
          id: "PRJ-001",
          title: "E-commerce Platform Redesign",
          description:
            "Complete redesign of the e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness.",
          startDate: "2024-05-01",
          endDate: "2024-08-15",
          status: "active",
          priority: "high",
          budget: 150000,
          completion: 65,
          team: { ...mockTeams[0] },
          tasks: [
            {
              id: "task-1",
              title: "Design new homepage layout",
              description: "Create wireframes and mockups for the new homepage",
              assignedTo: ["user-3"],
              status: "completed",
              priority: "high",
              dueDate: "2024-06-01",
              estimatedHours: 40,
            },
            {
              id: "task-2",
              title: "Implement product catalog",
              description: "Build the product catalog with filtering and search",
              assignedTo: ["user-1", "user-2"],
              status: "in-progress",
              priority: "high",
              dueDate: "2024-06-15",
              estimatedHours: 80,
            },
          ],
        },
        {
          id: "PRJ-002",
          title: "Mobile Banking Application",
          description:
            "Cross-platform mobile banking app with advanced security features and intuitive user interface.",
          startDate: "2024-04-10",
          endDate: "2024-09-30",
          status: "planning",
          priority: "critical",
          budget: 300000,
          completion: 25,
          tasks: [],
        },
        {
          id: "PRJ-003",
          title: "API Integration Suite",
          description:
            "Comprehensive API integration platform for connecting with third-party services and internal systems.",
          startDate: "2024-05-12",
          endDate: "2024-07-20",
          status: "active",
          priority: "medium",
          budget: 75000,
          completion: 40,
          team: { ...mockTeams[1] },
          tasks: [
            {
              id: "task-3",
              title: "Design API architecture",
              description: "Plan the overall API architecture and endpoints",
              assignedTo: ["user-4"],
              status: "completed",
              priority: "high",
              dueDate: "2024-05-20",
              estimatedHours: 24,
            },
          ],
        },
        {
          id: "PRJ-004",
          title: "Customer Support Portal",
          description: "Self-service customer support portal with ticketing system and knowledge base.",
          startDate: "2024-06-01",
          endDate: "2024-08-30",
          status: "on-hold",
          priority: "low",
          budget: 50000,
          completion: 10,
          tasks: [],
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const getProjectStats = () => {
    const total = projects.length
    const active = projects.filter((p) => p.status === "active").length
    const completed = projects.filter((p) => p.status === "completed").length
    const onHold = projects.filter((p) => p.status === "on-hold").length

    return { total, active, completed, onHold }
  }

  const stats = getProjectStats()

  // Get the current project for team assignment or task assignment
  const currentProject = assignTeamProjectId
    ? projects.find((p) => p.id === assignTeamProjectId)
    : assignTaskProjectId
      ? projects.find((p) => p.id === assignTaskProjectId)
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Management Hub</h1>
                <p className="text-gray-600 mt-1">Manage teams, assign tasks, and track project progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>New Project</span>
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-300 flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-gray-50/50 rounded-xl p-6 mb-8 border border-gray-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search projects by name, ID, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm appearance-none"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing <span className="font-semibold text-gray-900">{filteredProjects.length}</span> of{" "}
                {projects.length} projects
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters Applied: {(statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Timeline & Progress
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Team & Tasks
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            {Array(6)
                              .fill(0)
                              .map((_, i) => (
                                <td key={i} className="px-6 py-6">
                                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                              ))}
                          </tr>
                        ))
                    : filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-1 rounded-md">
                                  {project.id}
                                </span>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}
                                >
                                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
                                {project.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                                  Budget: ${project.budget.toLocaleString()}
                                </span>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
                                >
                                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("-", " ")}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-6">
                            <div className="flex flex-col space-y-2 text-sm">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm mt-2">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-gray-900">{project.completion}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.completion}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-6">
                            {project.team ? (
                              <div className="flex flex-col space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-800 text-sm">{project.team.name}</span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {project.team.members.length} members
                                  </span>
                                </div>
                                <div className="flex items-center -space-x-2">
                                  {project.team.members.slice(0, 4).map((user, i) => (
                                    <div key={user.id} className="relative group/avatar">
                                      <div className="relative">
                                        <img
                                          src={user.avatar || "/placeholder.svg"}
                                          alt={user.name}
                                          className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform duration-200 cursor-pointer"
                                        />
                                        <div className="absolute -bottom-1 -right-1">
                                          {getUserStatusIcon(user.status)}
                                        </div>
                                      </div>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-gray-300">{user.role}</div>
                                        <div className="text-gray-400 text-xs">{user.email}</div>
                                      </div>
                                    </div>
                                  ))}
                                  {project.team.members.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
                                      +{project.team.members.length - 4}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Tasks: <span className="font-semibold text-gray-800">{project.tasks.length}</span>
                                  {project.tasks.length > 0 && (
                                    <div className="flex items-center space-x-1 mt-1">
                                      <span className="text-green-600">
                                        {project.tasks.filter((t) => t.status === "completed").length} completed
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-blue-600">
                                        {project.tasks.filter((t) => t.status === "in-progress").length} in progress
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-4 px-2">
                                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <span className="text-gray-500 text-sm mb-3">No team assigned</span>
                                <button
                                  onClick={() => setAssignTeamProjectId(project.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  <span>Assign Team</span>
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-6">
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                onClick={() => setAssignTaskProjectId(project.id)}
                                className="w-full px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-2"
                                title="Add Task"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                <span>Add Task</span>
                              </button>

                              <div className="flex justify-center items-center space-x-2 w-full">
                                <button
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100"
                                  title="Edit Project"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Team Modal */}
      {assignTeamProjectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Assign Team to Project: {currentProject?.title}</h2>
                <button
                  onClick={() => setAssignTeamProjectId(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6">
                {mockTeams.map((team) => (
                  <div
                    key={team.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => assignTeam(assignTeamProjectId, team)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-600">{team.department}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {team.members.length} members
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-sm text-gray-700">Team Lead:</div>
                        <div className="flex items-center space-x-2">
                          {team.members
                            .filter((m) => m.id === team.lead)
                            .map((lead) => (
                              <div key={lead.id} className="flex items-center space-x-2">
                                <div className="relative">
                                  <img
                                    src={lead.avatar || "/placeholder.svg"}
                                    alt={lead.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <div className="absolute -bottom-0.5 -right-0.5">
                                    {getUserStatusIcon(lead.status)}
                                  </div>
                                </div>
                                <span className="text-sm font-medium">{lead.name}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm text-gray-700 mb-2">Team Members:</div>
                        <div className="flex flex-wrap gap-2">
                          {team.members
                            .filter((m) => m.id !== team.lead)
                            .map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg"
                              >
                                <div className="relative">
                                  <img
                                    src={member.avatar || "/placeholder.svg"}
                                    alt={member.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <div className="absolute -bottom-0.5 -right-0.5">
                                    {getUserStatusIcon(member.status)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.role}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setAssignTeamProjectId(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {assignTaskProjectId && currentProject?.team && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Task to Project: {currentProject.title}</h2>
                <button
                  onClick={() => setAssignTaskProjectId(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title*
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="task-priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      id="task-due-date"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="task-hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Hours
                  </label>
                  <input
                    id="task-hours"
                    type="number"
                    min="0"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number.parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assign Team Members*</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {currentProject.team.members.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          newTask.assignedTo.includes(member.id)
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                        onClick={() => toggleTaskAssignment(member.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5">{getUserStatusIcon(member.status)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.role}</div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border ${
                            newTask.assignedTo.includes(member.id)
                              ? "bg-blue-500 border-blue-500 flex items-center justify-center"
                              : "border-gray-300"
                          }`}
                        >
                          {newTask.assignedTo.includes(member.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setAssignTaskProjectId(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => addTaskToProject(assignTaskProjectId)}
                disabled={!newTask.title.trim() || newTask.assignedTo.length === 0}
                className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                  !newTask.title.trim() || newTask.assignedTo.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transition-colors"
                }`}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal for Task Assignment without Team */}
      {assignTaskProjectId && !currentProject?.team && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Team Required</h2>
                <p className="text-gray-600 mb-6">
                  You need to assign a team to this project before you can add tasks.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setAssignTaskProjectId(null)
                      setAssignTeamProjectId(currentProject?.id || null)
                    }}
                    className="px-5 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    Assign Team Now
                  </button>
                  <button
                    onClick={() => setAssignTaskProjectId(null)}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
