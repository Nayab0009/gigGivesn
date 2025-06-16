"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Edit, Trash2, Eye, RefreshCw, ClipboardCheck, AlertCircle, ChevronDown, UserCheck } from "lucide-react"
import { AssignTeamModal } from "../adminDashboard/AssignProjectTeam"
import { AssignTaskModal } from "../adminDashboard/AssignProjectTicket"
import { useAuth } from "@/context/AuthContext"
import axiosInstance from "@/lib/axios"
import type { Task, Team, Project } from "@/types"

// Local interface matching backend response
interface BackendProject {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

// --- Helpers ---
const generateAvatar = (name: string, index: number) => {
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
  ]
  return avatarStyles[index % avatarStyles.length]
}

const getUserStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
    case "busy":
      return <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></div>
    case "offline":
      return <div className="w-2 h-2 bg-slate-400 rounded-full shadow-sm"></div>
    default:
      return <div className="w-2 h-2 bg-slate-400 rounded-full shadow-sm"></div>
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 ring-1 ring-red-200 shadow-sm"
    case "high":
      return "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200 ring-1 ring-orange-200 shadow-sm"
    case "medium":
      return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 ring-1 ring-blue-200 shadow-sm"
    case "low":
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
    case "in-progress":
      return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200 shadow-sm"
    case "planning":
    case "pending":
      return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 ring-1 ring-blue-200 shadow-sm"
    case "on-hold":
    case "blocked":
      return "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 ring-1 ring-amber-200 shadow-sm"
    case "completed":
      return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 ring-1 ring-green-200 shadow-sm"
    case "cancelled":
      return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 ring-1 ring-red-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
  }
}

// --- Main Component ---
export default function ProjectDashboard() {
  // Get user data from AuthContext
  const { user } = useAuth()
  
  // State management
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<BackendProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assignTeamProjectId, setAssignTeamProjectId] = useState<string | null>(null)
  const [assignTaskProjectId, setAssignTaskProjectId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  })
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    assignedTo: [],
    status: "pending",
    priority: "medium",
    dueDate: "",
    estimatedHours: 0,
  })

  // Fetch manager projects function
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
      const activeProjects = projectsData.filter((p: BackendProject) => 
        p.isActive
      ).length
      const completedProjects = projectsData.filter((p: BackendProject) => 
        !p.isActive
      ).length
      
      setAnalytics({
        totalProjects,
        activeProjects,
        completedProjects,
      })
      
    } catch (error) {
      console.error("Error fetching manager projects:", error)
      setError("Failed to load projects. Please try again.")
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch teams data (keeping the mock data for now)
  const fetchTeams = async () => {
    try {
      // You can replace this with actual API call when teams endpoint is available
      setTeams([
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
      ])
    } catch (err) {
      console.error('Error fetching teams:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchManagerProjects()
      fetchTeams()
    }
  }, [user?.id])

  // Refresh data function
  const refreshData = () => {
    fetchManagerProjects()
  }

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        (project.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (project.id?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      // Remove status and priority filters since they don't exist in backend
      return matchesSearch
    })
  }, [projects, searchTerm])

  // --- Assign Team Logic ---
  const assignTeam = (projectId: string, team: Team) => {
    setProjects((prev) => prev.map((p) => (p.id.toString() === projectId ? { ...p, team } : p)))
    setAssignTeamProjectId(null)
  }

  // --- Assign Task Logic ---
  const addTaskToProject = (projectId: string | null) => {
    if (!projectId || !newTask.title.trim() || newTask.assignedTo.length === 0) return
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
    }
    // Since tasks don't exist in backend response, we'll just close the modal
    setNewTask({
      id: "",
      title: "",
      description: "",
      assignedTo: [],
      status: "pending",
      priority: "medium",
      dueDate: "",
      estimatedHours: 0,
    })
    setAssignTaskProjectId(null)
  }

  // --- Toggle Task Assignment ---
  const toggleTaskAssignment = (userId: string) => {
    setNewTask((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }))
  }

  const currentProject = assignTeamProjectId
    ? projects.find((p) => p.id.toString() === assignTeamProjectId)
    : assignTaskProjectId
      ? projects.find((p) => p.id.toString() === assignTaskProjectId)
      : null

  // Show authentication error if user is not logged in
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h2>
            <p className="text-slate-600">Please log in to view your assigned projects.</p>
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8 ml-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back, {user.name || user.email}! Manage and track your assigned projects</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">Error loading projects</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refreshData}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-100 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by name, ID, or description..."
                className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md bg-white/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw className={`w-4 h-4 transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-lg border border-white/50 overflow-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-gray-600 text-lg">Loading your assigned projects...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-200">
                <thead className="bg-gradient-to-r from-emerald-100 to-teal-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-emerald-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-gray-600 text-lg font-medium mb-1">
                            {error ? 'Unable to load projects' : 'No projects found'}
                          </p>
                          <p className="text-gray-500">
                            {error ? 'Please try refreshing the page' : 'You have no assigned projects matching the current filters'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project, index) => (
                      <tr
                        key={project.id.toString()}
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/50 transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white/60" : "bg-emerald-50/30"
                        }`}
                      >
                        <td className="px-6 py-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700">
                            {project.id}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{project.name}</h3>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{project.description}</p>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-gray-700 text-sm">
                            {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-gray-700 text-sm">
                            {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${project.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                            {project.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-3">
                            <button
                              className="group inline-flex items-center gap-1 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                              onClick={() => setAssignTeamProjectId(project.id.toString())}
                            >
                              <UserCheck className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                              Assign Team
                            </button>
                            <button
                              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                              onClick={() => setAssignTaskProjectId(project.id.toString())}
                            >
                              <ClipboardCheck className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                              Assign Task
                            </button>

                            <div className="flex items-center gap-2">
                              <button className="group inline-flex items-center justify-center w-8 h-8 text-teal-600 hover:text-white bg-teal-50 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="group inline-flex items-center justify-center w-8 h-8 text-amber-600 hover:text-white bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="group inline-flex items-center justify-center w-8 h-8 text-rose-600 hover:text-white bg-rose-50 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODALS */}
        <AssignTeamModal
          open={!!assignTeamProjectId}
          onClose={() => setAssignTeamProjectId(null)}
          onAssign={(team) => assignTeam(assignTeamProjectId!, team)}
          project={currentProject ? {
            id: currentProject.id.toString(),
            title: currentProject.name,
            description: currentProject.description,
            startDate: currentProject.startDate,
            endDate: currentProject.endDate,
            status: currentProject.isActive ? "active" : "on-hold",
            priority: "medium",
            budget: 0,
            completion: 0,
            tasks: []
          } : null}
          teams={teams}
          getUserStatusIcon={getUserStatusIcon}
        />
        <AssignTaskModal
          open={!!assignTaskProjectId}
          onClose={() => setAssignTaskProjectId(null)}
          onAdd={() => addTaskToProject(assignTaskProjectId)}
          task={newTask}
          setTask={setNewTask}
          teamMembers={teams.flatMap((team) => team.members)}
          toggleAssignment={toggleTaskAssignment}
          getUserStatusIcon={getUserStatusIcon}
        />
      </div>
    </div>
  )
}
