"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  AlertTriangle,
  X,
  Eye,
  Building2,
  Star,
  ArrowLeft,
  ClipboardList,
  Send,
  Edit3,
} from "lucide-react"
import { colors } from "@/colors"
import { ShowEmployeeTasks, FetchEmployeeProjectTasks } from "@/lib/TeamService"
// Interface for project (from taskOf object)
interface Project {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Interface for task response from backend
interface TaskResponse {
  id: number
  title: string
  description: string
  status: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  taskFor: {
    id: number
    name: string
    email: string
    phone: string
    address: string
    role: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  taskOf: Project
}

// Interface for project with tasks
interface ProjectWithTasks {
  project: Project
  tasks: TaskResponse[]
}

const EmployeeTasks = () => {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<"projects" | "tasks">("projects")

  // Modal states
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Fetch projects for employee
  const fetchEmployeeProjects = async () => {
    if (!isAuthenticated || !user?.id) {
      setError("User not authenticated")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await ShowEmployeeTasks()
      console.log("Projects fetched:", response)
      const projectsData = Array.isArray(response) ? response : []
      setProjects(projectsData)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load projects. Please try again.")
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch tasks for selected project
  const fetchProjectTasks = async (projectId: number) => {
    if (!isAuthenticated || !user?.id) {
      setError("User not authenticated")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const tasksData = await FetchEmployeeProjectTasks(user.id, projectId)
      setTasks(tasksData)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load tasks. Please try again.")
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setViewMode("tasks")
    fetchProjectTasks(project.id)
  }

  // Go back to projects view
  const goBackToProjects = () => {
    setViewMode("projects")
    setSelectedProject(null)
    setTasks([])
  }

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true)
    if (viewMode === "projects") {
      await fetchEmployeeProjects()
    } else if (selectedProject) {
      await fetchProjectTasks(selectedProject.id)
    }
    setRefreshing(false)
  }

  // Modal handlers
  const handleSubmitReport = (task: TaskResponse) => {
    // Navigate to the submit report page with task data
    router.push(`/dashboard/teammember/submittaskreport?taskId=${task.id}&projectId=${task.taskOf.id}`)
  }

  const handleUpdateStatus = (task: TaskResponse) => {
    setSelectedTask(task)
    setNewStatus(task.status)
    setShowUpdateStatusModal(true)
  }

  const closeUpdateStatusModal = () => {
    setShowUpdateStatusModal(false)
    setSelectedTask(null)
    setNewStatus("")
    setUpdatingStatus(false)
  }

  const updateTaskStatus = async () => {
    if (!selectedTask || !newStatus.trim()) return

    setUpdatingStatus(true)
    try {
      // PATCH API call to update task status
      const response = await axiosInstance.patch(`/tasks/${selectedTask.id}`, {
        status: newStatus,
      })
      console.log("Task status updated successfully:", response.data)

      closeUpdateStatusModal()
      // Refresh data to show updated status
      await fetchProjectTasks(selectedProject!.id)
    } catch (error: any) {
      console.error("Error updating task status:", error)
      setError(error.response?.data?.message || "Failed to update task status. Please try again.")
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          color: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
          borderColor: "border-emerald-200",
          glowColor: "shadow-emerald-100",
        }
      case "inprogress":
        return {
          color: "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200",
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
          borderColor: "border-teal-200",
          glowColor: "shadow-teal-100",
        }
      case "cancelled":
        return {
          color: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200",
          icon: <AlertTriangle className="w-4 h-4" />,
          bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
          borderColor: "border-red-200",
          glowColor: "shadow-red-100",
        }
      default:
        return {
          color: "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200",
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
          borderColor: "border-slate-200",
          glowColor: "shadow-slate-100",
        }
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate project progress
  const getProjectProgress = (project: Project) => {
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    const today = new Date()

    if (today < startDate) return 0
    if (today > endDate) return 100

    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsed = today.getTime() - startDate.getTime()
    return Math.round((elapsed / totalDuration) * 100)
  }

  // Get task statistics for a project
  const getProjectTaskStats = (tasks: TaskResponse[]) => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status.toLowerCase() === "completed").length
    const inProgress = tasks.filter((task) => task.status.toLowerCase() === "inprogress").length
    const cancelled = tasks.filter((task) => task.status.toLowerCase() === "cancelled").length

    return { total, completed, inProgress, cancelled }
  }

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchEmployeeProjects()
    }
  }, [isAuthenticated, user?.id])

  // Show authentication error if user is not logged in
  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
            <p className="text-slate-600 text-lg">Please log in to view your assigned projects.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h1
              className="text-5xl sm:text-6xl font-bold mb-4"
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {viewMode === "projects" ? "My Projects" : selectedProject?.name}
            </h1>
            <div
              className="w-24 h-1 mx-auto rounded-full mb-6"
              style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})` }}
            ></div>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.primary.hex }}>
              {viewMode === "projects" ? (
                <>
                  Welcome back,{" "}
                  <span style={{ color: colors.secondary.hex, fontWeight: 600 }}>{user.name || user.email}</span>! Here
                  are your assigned projects
                </>
              ) : (
                <>
                  Tasks for project:{" "}
                  <span style={{ color: colors.secondary.hex, fontWeight: 600 }}>{selectedProject?.name}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Back Button for Tasks View */}
        {viewMode === "tasks" && (
          <div className="mb-6">
            <button
              onClick={goBackToProjects}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              style={{
                background: "#fff",
                color: colors.primary.hex,
                border: `1px solid ${colors.primary.hex}`,
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.secondary.hex }} />
              Back to Projects
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div
          className="mb-8 rounded-3xl shadow-2xl p-8 text-white"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
          }}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  style={{ background: colors.accent.hex }}
                >
                  {viewMode === "projects" ? (
                    <Building2 className="w-6 h-6" style={{ color: colors.primary.hex }} />
                  ) : (
                    <ClipboardList className="w-6 h-6" style={{ color: colors.primary.hex }} />
                  )}
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.highlight.hex }}>
                    {viewMode === "projects" ? "Total Projects" : "Total Tasks"}
                  </p>
                  <p className="font-bold text-lg" style={{ color: "#fff" }}>
                    {viewMode === "projects" ? projects.length : tasks.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  style={{ background: colors.accent.hex }}
                >
                  <Star className="w-6 h-6" style={{ color: colors.primary.hex }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.highlight.hex }}>
                    {viewMode === "projects" ? "Total Tasks" : "Completed"}
                  </p>
                  <p className="font-bold text-lg" style={{ color: "#fff" }}>
                    {viewMode === "projects"
                      ? tasks.length
                      : tasks.filter((task) => task.status.toLowerCase() === "completed").length}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing || isLoading}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border"
              style={{
                background: colors.accent.hex,
                color: colors.primary.hex,
                borderColor: colors.primary.hex,
              }}
            >
              <RefreshCw
                className={`w-5 h-5 transition-transform duration-300 ${refreshing ? "animate-spin" : "group-hover:rotate-180"}`}
                style={{ color: colors.secondary.hex }}
              />
              Refresh {viewMode === "projects" ? "Projects" : "Tasks"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-8 rounded-3xl p-6 shadow-lg"
            style={{ background: colors.warning.hex, color: "#fff", border: `1px solid ${colors.primary.hex}` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: colors.accent.hex }}
              >
                <AlertCircle className="w-5 h-5" style={{ color: colors.primary.hex }} />
              </div>
              <p className="font-semibold text-lg">Error loading {viewMode}</p>
            </div>
            <p className="mb-4 ml-13">{error}</p>
            <button
              onClick={refreshData}
              className="ml-13 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ background: colors.primary.hex, color: "#fff" }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                style={{ background: colors.accent.hex }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary.hex }} />
              </div>
              <p className="text-xl font-medium" style={{ color: colors.primary.hex }}>
                Loading your assigned {viewMode}...
              </p>
            </div>
          ) : viewMode === "projects" ? (
            // Projects Table View
            projects.length === 0 ? (
              <div className="p-16 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
                  style={{ background: colors.accent.hex }}
                >
                  <Building2 className="w-10 h-10" style={{ color: colors.primary.hex }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: colors.primary.hex }}>
                  No Projects Assigned
                </h3>
                <p className="text-lg" style={{ color: colors.secondary.hex }}>
                  You don't have any projects assigned to you at the moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b-2"
                      style={{ borderColor: colors.primary.hex, background: colors.accent.hex }}
                    >
                      <th className="text-left p-6 font-bold text-lg" style={{ color: colors.primary.hex }}>
                        Project Name
                      </th>
                      <th
                        className="text-left p-6 font-bold text-lg hidden md:table-cell"
                        style={{ color: colors.primary.hex }}
                      >
                        Description
                      </th>
                      <th className="text-center p-6 font-bold text-lg" style={{ color: colors.primary.hex }}>
                        Status
                      </th>
                      <th
                        className="text-center p-6 font-bold text-lg hidden lg:table-cell"
                        style={{ color: colors.primary.hex }}
                      >
                        Start Date
                      </th>
                      <th
                        className="text-center p-6 font-bold text-lg hidden lg:table-cell"
                        style={{ color: colors.primary.hex }}
                      >
                        End Date
                      </th>
                      <th className="text-center p-6 font-bold text-lg" style={{ color: colors.primary.hex }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr
                        key={project.id}
                        className="border-b transition-all duration-300 hover:shadow-lg"
                        style={{
                          borderColor: colors.accent.hex,
                          background: index % 2 === 0 ? "#fff" : colors.accent.hex + "20",
                        }}
                      >
                        <td className="p-6">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primary.hex }}>
                              {project.name}
                            </h3>
                            <div className="md:hidden text-sm" style={{ color: colors.secondary.hex }}>
                              {project.description || "No description provided"}
                            </div>
                          </div>
                        </td>
                        <td className="p-6 hidden md:table-cell">
                          <p className="text-sm max-w-xs" style={{ color: colors.secondary.hex }}>
                            {project.description || "No description provided"}
                          </p>
                        </td>
                        <td className="p-6 text-center">
                          <span
                            className="px-4 py-2 rounded-full text-sm font-medium border inline-flex items-center gap-2"
                            style={{
                              background: project.isActive ? colors.accent.hex : "#f1f5f9",
                              color: project.isActive ? colors.primary.hex : colors.secondary.hex,
                              borderColor: colors.primary.hex,
                            }}
                          >
                            {project.isActive ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {project.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-6 text-center hidden lg:table-cell">
                          <div
                            className="flex items-center justify-center gap-2 text-sm"
                            style={{ color: colors.secondary.hex }}
                          >
                            <Calendar className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            {formatDate(project.startDate)}
                          </div>
                        </td>
                        <td className="p-6 text-center hidden lg:table-cell">
                          <div
                            className="flex items-center justify-center gap-2 text-sm"
                            style={{ color: colors.secondary.hex }}
                          >
                            <Calendar className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            {formatDate(project.endDate)}
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => handleProjectSelect(project)}
                            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow hover:shadow-lg transform hover:scale-105 inline-flex items-center gap-2"
                            style={{
                              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                              color: "#fff",
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View Tasks
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : // Tasks Table View
          !selectedProject ? (
            <div className="p-16 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
                style={{ background: colors.accent.hex }}
              >
                <AlertCircle className="w-10 h-10" style={{ color: colors.primary.hex }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: colors.primary.hex }}>
                No Project Selected
              </h3>
              <p className="text-lg" style={{ color: colors.secondary.hex }}>
                Please select a project to view its tasks.
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-16 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
                style={{ background: colors.accent.hex }}
              >
                <CheckCircle className="w-10 h-10" style={{ color: colors.primary.hex }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: colors.primary.hex }}>
                No Tasks Assigned
              </h3>
              <p className="text-lg" style={{ color: colors.secondary.hex }}>
                You don't have any tasks assigned for this project.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: colors.primary.hex, background: colors.accent.hex }}>
                    <th className="text-left p-6 font-bold text-lg" style={{ color: colors.primary.hex }}>
                      Task Title
                    </th>
                    <th
                      className="text-left p-6 font-bold text-lg hidden md:table-cell"
                      style={{ color: colors.primary.hex }}
                    >
                      Description
                    </th>
                    <th className="text-center p-6 font-bold text-lg" style={{ color: colors.primary.hex }}>
                      Status
                    </th>
                    <th
                      className="text-center p-6 font-bold text-lg hidden lg:table-cell"
                      style={{ color: colors.primary.hex }}
                    >
                      Created
                    </th>
                    <th className="text-center p-6 font-bold text-lg" style={{ color: colors.primary.hex }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => {
                    const statusInfo = getStatusInfo(task.status)
                    return (
                      <tr
                        key={task.id}
                        className="border-b transition-all duration-300 hover:shadow-lg"
                        style={{
                          borderColor: colors.accent.hex,
                          background: index % 2 === 0 ? "#fff" : colors.accent.hex + "20",
                        }}
                      >
                        <td className="p-6">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primary.hex }}>
                              {task.title}
                            </h3>
                            <div className="md:hidden text-sm" style={{ color: colors.secondary.hex }}>
                              {task.description || "No description provided"}
                            </div>
                          </div>
                        </td>
                        <td className="p-6 hidden md:table-cell">
                          <p className="text-sm max-w-xs" style={{ color: colors.secondary.hex }}>
                            {task.description || "No description provided"}
                          </p>
                        </td>
                        <td className="p-6 text-center">
                          <span
                            className="px-4 py-2 rounded-full text-sm font-medium border inline-flex items-center gap-2"
                            style={{
                              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                              color: "#fff",
                            }}
                          >
                            {statusInfo.icon}
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-6 text-center hidden lg:table-cell">
                          <div
                            className="flex items-center justify-center gap-2 text-sm"
                            style={{ color: colors.secondary.hex }}
                          >
                            <Calendar className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            {formatDate(task.createdAt)}
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                            <button
                              onClick={() => handleSubmitReport(task)}
                              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow hover:shadow-lg transform hover:scale-105 inline-flex items-center gap-2"
                              style={{
                                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                color: "#fff",
                              }}
                            >
                              <Send className="w-4 h-4" />
                              <span className="hidden sm:inline">Submit Report</span>
                              <span className="sm:hidden">Report</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(task)}
                              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow hover:shadow-lg transform hover:scale-105 inline-flex items-center gap-2"
                              style={{
                                background: colors.accent.hex,
                                color: colors.primary.hex,
                                border: `1px solid ${colors.primary.hex}`,
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="hidden sm:inline">Update Status</span>
                              <span className="sm:hidden">Update</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: colors.primary.hex }}>
                Update Task Status
              </h3>
              <button
                onClick={closeUpdateStatusModal}
                className="p-2 transition-colors rounded-lg hover:bg-slate-100"
                style={{ color: colors.secondary.hex }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2" style={{ color: colors.primary.hex }}>
                {selectedTask.title}
              </h4>
              <p className="text-sm mb-4" style={{ color: colors.secondary.hex }}>
                Update the status of this task.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.primary.hex }}>
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent"
                  style={{ borderColor: colors.primary.hex, color: colors.primary.hex }}
                >
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeUpdateStatusModal}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                style={{ background: colors.accent.hex, color: colors.primary.hex }}
              >
                Cancel
              </button>
              <button
                onClick={updateTaskStatus}
                disabled={!newStatus || updatingStatus}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                  color: "#fff",
                }}
              >
                {updatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.highlight.hex }} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" style={{ color: colors.highlight.hex }} />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeTasks
