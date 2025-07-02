"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, RefreshCw, AlertCircle, Users, X, Loader2, Trash2, Edit } from "lucide-react"
import { AssignTeamModal } from "../adminDashboard/AssignProjectTeam"
import { AssignTaskModal } from "../adminDashboard/AssignProjectTicket"
import { getProjectsForManagers } from "@/lib/SprintService"
import { getProjectTeam } from "@/lib/ProjectService"
import { updateProjectStatus } from "@/lib/ProjectService"
import { deleteProject } from "@/lib/ProjectService"
import { useAuth } from "@/context/AuthContext"
import axiosInstance from "@/lib/axios"
import type { Task, Team } from "@/types"
import { colors } from "@/colors"

// Project status enum
enum ProjectStatus {
  INPROGRESS = "inprogress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Local interface matching backend response
interface BackendProject {
  id: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  name: string
  description: string
  startDate: string
  endDate: string
  status?: string
}

// Interface for project team members
interface ProjectTeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status?: string
}

// Interface for project with team
interface ProjectWithTeam {
  id: number
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  teamMembers?: ProjectTeamMember[]
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

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase().replace(/[\s-]/g, "") || ""

  switch (normalizedStatus) {
    case "active":
    case "inprogress":
      return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200 shadow-sm"
    case "planning":
    case "pending":
      return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 ring-1 ring-blue-200 shadow-sm"
    case "onhold":
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

// Edit Status Modal Component
function EditStatusModal({
  open,
  onClose,
  project,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  project: BackendProject | null
  onUpdate: (projectId: number, status: string) => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (project && open) {
      setSelectedStatus(project.status || ProjectStatus.INPROGRESS)
    }
  }, [project, open])

  const handleUpdate = async () => {
    if (!project || !selectedStatus) return

    setIsUpdating(true)
    try {
      await onUpdate(project.id, selectedStatus)
      onClose()
    } catch (error) {
      console.error("Error updating project status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!open || !project) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 backdrop-blur-sm">
        {/* Header */}
        <div className="  p-6 text-white"  style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }} >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Update Project Status</h2>
              <p className="text-blue-200 text-sm">{project.name}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select New Status</label>
              <div className="space-y-2">
                {Object.values(ProjectStatus).map((status) => (
                  <label
                    key={status}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                      {status === ProjectStatus.INPROGRESS ? "In Progress" : status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || selectedStatus === project.status}
              className="px-4 py-2   text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// View Team Modal Component
function ViewTeamModal({
  open,
  onClose,
  projectId,
}: {
  open: boolean
  onClose: () => void
  projectId: number | null
}) {
  const [project, setProject] = useState<ProjectWithTeam | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjectTeam = async () => {
    if (!projectId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await getProjectTeam(String(projectId))
      console.log("Project team response:", response.data)
      setProject(response.data)
    } catch (error) {
      console.error("Error fetching project team:", error)
      setError("Failed to load project team. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && projectId) {
      fetchProjectTeam()
    }
  }, [open, projectId])

  if (!open || !projectId) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-white/50 backdrop-blur-sm">
        {/* Header */}
        <div className=" p-6 text-white"  style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Project Team</h2>
              <p className="text-emerald-200 text-sm">Team members for project {projectId}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Team...</h3>
              <p className="text-gray-500">Fetching team members for this project.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Team</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchProjectTeam}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : project ? (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm">{project.description}</p>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-lg text-gray-900">Team Members</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium">
                    {project.teamMembers?.length || 0} member{(project.teamMembers?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="grid gap-3">
                    {project.teamMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-emerald-200 hover:shadow-md transition-shadow"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={member.avatar || generateAvatar(member.name, index)}
                            alt={member.name}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                          />
                          {member.status && (
                            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full shadow-sm">
                              {getUserStatusIcon(member.status)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{member.name}</div>
                          <div className="text-sm text-gray-600 truncate">{member.role}</div>
                          <div className="text-xs text-gray-500 truncate">{member.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
                    <p className="text-gray-500">No team members have been assigned to this project yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
              <p className="text-gray-500">Unable to load project information.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-200 bg-emerald-50/50 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-emerald-300 rounded-xl text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function ProjectDashboard() {
  // Get user data from AuthContext
  const { user } = useAuth()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<BackendProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assignTeamProjectId, setAssignTeamProjectId] = useState<string | null>(null)
  const [assignTaskProjectId, setAssignTaskProjectId] = useState<string | null>(null)
  const [viewTeamProjectId, setViewTeamProjectId] = useState<number | null>(null)
  const [editStatusProjectId, setEditStatusProjectId] = useState<number | null>(null)
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    assignedTo: [],
    status: "pending",
    dueDate: "",
    estimatedHours: 0,
  })
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Fetch manager projects function
  const fetchManagerProjects = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching projects for manager:", user.id)
      const projectsData = await getProjectsForManagers(user.id)
      setProjects(Array.isArray(projectsData) ? projectsData : [])
    } catch (error) {
      console.error("Error fetching manager projects:", error)
      setError("Failed to load projects. Please try again.")
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchManagerProjects()
    }
  }, [user?.id])

  // Refresh data function
  const refreshData = () => {
    fetchManagerProjects()
  }

  // Delete project function
  const handleDeleteProject = async (projectId: number) => {
    setIsDeleting(projectId)

    try {
      await deleteProject(projectId)

      // Remove the project from the local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId))

      // Show success message (you can replace this with a toast notification)
      console.log("Project deleted successfully")
    } catch (error) {
      console.error("Error deleting project:", error)
      setError("Failed to delete project. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  // Update project status function
  const handleUpdatedProjectStatus = async (
    projectId: number,
    newStatus: string
  ) => {
    setIsLoading(true);
    setError(null);
  
    try {
      await updateProjectStatus(projectId, newStatus);
  
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: newStatus } : p
        )
      );
  
      console.log("Project status updated successfully");
    } catch (error) {
      console.error("Error updating project status:", error);
      setError("Failed to update project status. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        (project.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (project.id?.toString() || "").includes(searchTerm.toLowerCase()) ||
        (project.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [projects, searchTerm])

  // --- Assign Team Logic ---
  const assignTeam = (projectId: string, team: Team) => {
    setAssignTeamProjectId(null)
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

  const editProject = editStatusProjectId ? projects.find((p) => p.id === editStatusProjectId) : null

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
          <p className="text-gray-600 text-lg">
            Welcome back, {user.name || user.email}! Manage and track your assigned projects
          </p>
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
              style={{
                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
              }}
              className="group inline-flex items-center gap-2 px-6 py-3 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw
                className={`w-4 h-4 transition-transform duration-300 ${isLoading ? "animate-spin" : "group-hover:rotate-180"}`}
              />
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                        Actions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        View Team
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Settings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/80 divide-y divide-emerald-100">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                              <AlertCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="text-gray-600 text-lg font-medium mb-1">
                              {error ? "Unable to load projects" : "No projects found"}
                            </p>
                            <p className="text-gray-500">
                              {error
                                ? "Please try refreshing the page"
                                : "You have no assigned projects matching the current filters"}
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
                          <td className="px-6 py-4">
                            {project.status ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${getStatusColor(project.status)}`}
                              >
                                {project.status === "inprogress"
                                  ? "In Progress"
                                  : project.status
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) => str.toUpperCase())
                                      .trim()}
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${project.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
                              >
                                {project.isActive ? "Active" : "Inactive"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-row gap-2">
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}
                                onClick={() => setAssignTeamProjectId(project.id.toString())}
                              >
                                Assign Team
                              </button>
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}
                                onClick={() => setAssignTaskProjectId(project.id.toString())}
                              >
                                Assign Task
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                              <button
                                className="group inline-flex items-center justify-center w-8 h-8 text-white rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}
                                onClick={() => setViewTeamProjectId(project.id)}
                              >
                                <Users className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                              <button
                                className="group inline-flex items-center justify-center w-8 h-8 text-white rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}
                                onClick={() => setEditStatusProjectId(project.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="group inline-flex items-center justify-center w-8 h-8 text-white rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                }}
                                onClick={() => handleDeleteProject(project.id)}
                                disabled={isDeleting === project.id}
                              >
                                {isDeleting === project.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
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
          project={
            currentProject
              ? {
                  id: currentProject.id.toString(),
                  title: currentProject.name,
                  description: currentProject.description,
                  startDate: currentProject.startDate,
                  endDate: currentProject.endDate,
                  status: currentProject.isActive ? "active" : "on-hold",
                  budget: 0,
                  completion: 0,
                  tasks: [],
                }
              : null
          }
          teams={[]}
          getUserStatusIcon={getUserStatusIcon}
        />
        <AssignTaskModal
          open={!!assignTaskProjectId}
          onClose={() => setAssignTaskProjectId(null)}
          onAdd={() => {
            // Refresh the projects data after task assignment
            fetchManagerProjects()
            setAssignTaskProjectId(null)
          }}
          task={newTask}
          setTask={setNewTask}
          getUserStatusIcon={getUserStatusIcon}
          projectId={assignTaskProjectId ? Number.parseInt(assignTaskProjectId) : undefined}
        />
        <ViewTeamModal
          open={!!viewTeamProjectId}
          onClose={() => setViewTeamProjectId(null)}
          projectId={viewTeamProjectId}
        />
        <EditStatusModal
          open={!!editStatusProjectId}
          onClose={() => setEditStatusProjectId(null)}
          project={editProject}
          onUpdate={updateProjectStatus}
        />
      </div>
    </div>
  )
}
