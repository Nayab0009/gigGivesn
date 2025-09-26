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
  // Search state
  const [searchTerm, setSearchTerm] = useState("")

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

  // Handle project selection -> navigate to employee project details page
  const handleProjectSelect = (project: Project) => {
    router.push(`/dashboard/teammember/projects/${project.id}?tab=sprints`)
  }

  // Go back to projects view
  const goBackToProjects = () => {
    setViewMode("projects")
    setSelectedProject(null)
    setTasks([])
  }
const truncateByWords = (text: string, maxLength: number = 100) => {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
};
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
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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


  // --- Avatar generator (from ProjectTable) ---
  const generateAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=a7f3d0,bbf7d0,d1fae5,ecfdf5,f0fdfa`
  }


  // --- Filtering logic for search ---
  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase()
    return (
      (project.name?.toLowerCase() || "").includes(term) ||
      (project.id?.toString() || "").includes(term) ||
      (project.description?.toLowerCase() || "").includes(term)
    )
  })
  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase()
    return (
      (task.title?.toLowerCase() || "").includes(term) ||
      (task.id?.toString() || "").includes(term) ||
      (task.description?.toLowerCase() || "").includes(term)
    )
  })

  return (
    <div className="w-full relative top-[30px] max-w-full">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8 ml-2">
          <h1
            className="font-roboto font-semibold text-[20px] leading-[28px] tracking-[0px] align-middle text-white mb-2"
          >
            {viewMode === "projects" ? "My Projects" : selectedProject?.name}
          </h1>
          <p
            className="font-roboto font-normal text-[14px] leading-[20px] tracking-[0px] align-middle text-white"
          >
            {viewMode === "projects"
              ? `Welcome back, ${user.name || user.email}! Here are your assigned projects`
              : `Tasks for project: ${selectedProject?.name}`}
          </p>
        </div>

        {/* Action Bar */}
        <div
          className="mb-8 bg-black/30 rounded-[24px] shadow-lg border border-[#FFFFFF4D] p-[25px]"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar and View Toggle Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 w-full">
              {/* Search Bar */}
              <div className="relative flex-1 w-full h-[44px]">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input
                  type="text"
                  placeholder={viewMode === "projects" ? "Search projects by name, ID, or description..." : "Search tasks by title, ID, or description..."}
                  style={{ backgroundColor: colors.black.transparent40 }}
                  className="w-full h-[44px] pl-[48px] pr-[16px] py-[12px] rounded-[16px] backdrop-blur-[100px] text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 shadow-sm focus:shadow-md placeholder:font-inter placeholder:font-medium placeholder:text-[14px] placeholder:leading-[20px] placeholder:tracking-[0px] placeholder:align-middle placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="group inline-flex items-center justify-center gap-2 w-[122.52px] h-[46px] px-[25px] py-[13px] rounded-[99px] bg-[#0CA9F6] border border-[#57B5E7E5] text-white text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw
                className={`w-4 h-4 transition-transform duration-300 ${isLoading ? "animate-spin" : "group-hover:rotate-180"}`}
              />
              Refresh
            </button>
          </div>
        </div>

  {/* Back Button for Tasks View */}
        {viewMode === "tasks" && (
          <div className="mb-6">
            <button
              onClick={goBackToProjects}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              style={{
                background: "#0000004D",
                color: "#fff",
                border: "1px solid #FFFFFF4D",
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#fff" }} />
              Back to Projects
            </button>
          </div>
        )}

  {/* Stats Bar removed, now in header */}

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
        {/* Table Container - mirror ProjectTable UI */}
        <div
          className="relative rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-xl"
          style={{
            background: "#0000005D",
            borderColor: "#FFFFFF4D",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
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
            filteredProjects.length === 0 ? (
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
              <div className="overflow-x-hidden">
                <table className="min-w-full  divide-y divide-white/10">
                  <thead className="backdrop-blur-md bg-white/5" style={{height: '73px', borderBottom: '5px solid #FFFFFF1A'}}>
                    <tr className="h-[56px]">
                      <th className="px-4 sm:px-6 py-4 text-left w-[180px] border-b-2 border-[#4A6A65]">
                        <span className="font-[Roboto] font-bold text-white text-[14px] leading-[20px] tracking-[0.7px] text-left uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                          NAME
                        </span>
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left w-[260px] border-b-2 border-[#4A6A65]">
                        <span className="font-[Roboto] font-bold text-white text-[14px] leading-[20px] tracking-[0.7px] text-left uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                          DESCRIPTION
                        </span>
                      </th>
                      {/* Status column removed */}
                      <th className="px-4 sm:px-6 py-4 text-left w-[110px] border-b-2 border-[#4A6A65]">
                        <span className="font-[Roboto] font-bold text-white text-[14px] leading-[20px] tracking-[0.7px] text-left whitespace-nowrap uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                          START DATE
                        </span>
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left w-[110px] border-b-2 border-[#4A6A65]">
                        <span className="font-[Roboto] font-bold text-white text-[14px] leading-[20px] tracking-[0.7px] text-left whitespace-nowrap uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                          END DATE
                        </span>
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left w-[160px] border-b-2 border-[#4A6A65]">
                        <span className="font-[Roboto] font-bold text-white text-[14px] leading-[20px] tracking-[0.7px] text-left uppercase" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
                          ACTIONS
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-400" style={{ borderColor: '#BDBDBD' }}>
                    {filteredProjects.map((project, index) => (
                      <tr
                        key={project.id}
                        className="transition-colors duration-300 bg-transparent hover:bg-white/5"
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2 flex items-center gap-3">
                            {/* Circular Logo */}
                            <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 flex items-center justify-center">
                              <img
                                src={generateAvatar(project.name)}
                                alt={project.name + ' avatar'}
                                className="w-full h-full object-cover rounded-full"
                                style={{ width: 40, height: 40 }}
                              />
                            </div>
                            <div>
                              <h3
                                className="text-xs sm:text-sm  leading-tight break-words whitespace-normal"
                                style={{ color: "#FFFFFF", fontWeight: 500, wordBreak: 'break-word', fontSize: '16px' }}
                              >
                                {(() => {
                                  // Split name into words, insert <br/> after every 30 words
                                  if (!project.name) return null;
                                  const words = project.name.split(' ');
                                  const lines = [];
                                  for (let i = 0; i < words.length; i += 30) {
                                    lines.push(words.slice(i, i + 30).join(' '));
                                  }
                                  return lines.map((line, idx) => (
                                    <span key={idx}>
                                      {line}
                                      {idx !== lines.length - 1 && <br />}
                                    </span>
                                  ));
                                })()}
                              </h3>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm leading-relaxed break-words whitespace-normal max-w-2xl" style={{ color: "#A8A8A8" }}>
                           {truncateByWords(project.description, 30)}
                          </p>
                        </td>
                        {/* Status cell removed */}
                        <td className="px-6 py-6">
                          <span className="text-sm text-white/80 whitespace-nowrap">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-sm text-white/80">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <button
                            onClick={() => handleProjectSelect(project)}
                            className="group inline-flex items-center justify-center w-12 h-12 "

                          >
                            <img
                              src="/images/icons/BUTTON-168.svg"
                              alt="View Tasks"
                              className="w-10 h-10 object-contain"
                              style={{ display: 'block', margin: 'auto' }}
                            />
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
          ) : filteredTasks.length === 0 ? (
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
              <table className="min-w-full divide-y divide-white/10">
                <thead className="backdrop-blur-md bg-white/5">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left w-[180px]">
                      <div className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white">
                        <span className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]">Task Title</span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[260px]">
                      <div className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white">
                        <span className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]">Description</span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[110px]">
                      <div className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white">
                        <span className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px] whitespace-nowrap">Status</span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[110px]">
                      <div className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white">
                        <span className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px] whitespace-nowrap">Created</span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[120px]">
                      <div className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white">
                        <span className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]">Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/10 text-white/90" style={{ borderColor: '#FFFFFF26' }}>
                  {filteredTasks.map((task, index) => {
                    const statusInfo = getStatusInfo(task.status)
                    return (
                      <tr
                        key={task.id}
                        className="border-b transition-all duration-300 hover:shadow-lg hover:bg-white/5"
                        style={{ borderColor: "#FFFFFF26" }}
                      >
                        <td className="p-6">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold mb-1 text-white">
                              {task.title}
                            </h3>
                            <div className="md:hidden text-sm text-white/70">
                              {task.description || "No description provided"}
                            </div>
                          </div>
                        </td>
                        <td className="p-6 hidden md:table-cell">
                          <p className="text-sm max-w-xs text-white/70">
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
                            style={{ color: "#E5E7EB" }}
                          >
                            <Calendar className="w-4 h-4 text-white/80" />
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
                                color: "#fff",
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
