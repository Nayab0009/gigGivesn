"use client"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, RefreshCw, AlertCircle, Users, X, Loader2, Trash2, Edit, Table, LayoutGrid } from "lucide-react"
import { AssignTeamModal } from "../adminDashboard/AssignProjectTeam"
import { AssignTaskModal } from "../adminDashboard/AssignProjectTicket"
import { getProjectsForManagers } from "@/lib/SprintService"
import { getProjectTeam } from "@/lib/ProjectService"
import { updateProjectStatus } from "@/lib/ProjectService"
import { deleteProject } from "@/lib/ProjectService"
import { useAuth } from "@/context/AuthContext"
import type { Task, Team } from "@/types"
import { colors } from "@/colors"
import Pagination from "../pagination"

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
   logo?: string
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
    <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50 p-4">
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 text-white bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1 text-white">Update Project Status</h2>
              <p className="text-gray-300 text-sm">{project.name}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
       {/* Content */}
<div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-black/30 backdrop-blur-xl rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">Select New Status</label>
              <div className="space-y-2">
                {Object.values(ProjectStatus).map((status) => (
                  <label
                    key={status}
                    className="flex items-center p-3 border border-white/20 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 bg-white/5 backdrop-blur-sm"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-white border-white/20 focus:ring-white/30 bg-white/10"
                    />
                    <span className="ml-3 text-sm font-medium text-white capitalize">
                      {status === ProjectStatus.INPROGRESS ? "In Progress" : status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/20 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-200 bg-white/5 backdrop-blur-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating || selectedStatus === project.status}
              className="px-4 py-2 text-white rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-white" />}
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
    <div className="fixed inset-0  bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="  rounded-2xl  bg-black/30 backdrop-blur-sm shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 text-whitebackdrop-blur-sm border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1 text-white">Project Team</h2>
              <p className="text-gray-300 text-sm">Team members for project {projectId}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
    <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Loading Team...</h3>
              <p className="text-gray-400">Fetching team members for this project.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Error Loading Team</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchProjectTeam}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
              >
                Try Again
              </button>
            </div>
          ) : project ? (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-bold text-lg text-white mb-2">{project.name}</h3>
                <p className="text-gray-300 text-sm">{project.description}</p>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-white" />
                  <h3 className="font-semibold text-lg text-white">Team Members</h3>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-medium border border-white/10">
                    {project.teamMembers?.length || 0} member{(project.teamMembers?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
{project.teamMembers && project.teamMembers.length > 0 ? (
  <div className="grid gap-3">
    {project.teamMembers.map((member, index) => (
      <div
        key={member.id}
       className="flex items-center space-x-4 p-4 bg-black/30 rounded-xl border border-white/20 hover:bg-black/40 hover:shadow-md transition-all duration-200"
      >
        <div className="relative flex-shrink-0">
          <img
            src={member.avatar || generateAvatar(member.name, index)}
            alt={member.name}
            className="w-12 h-12 rounded-full border-2 border-white/20 shadow-sm"
          />
          {member.status && (
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-black/50 backdrop-blur-sm rounded-full shadow-sm">
              {getUserStatusIcon(member.status)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{member.name}</div>
          <div className="text-sm text-gray-300 truncate">{member.role}</div>
          <div className="text-xs text-gray-400 truncate">{member.email}</div>
        </div>
      </div>
    ))}
  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Team Members</h3>
                    <p className="text-gray-400">No team members have been assigned to this project yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Project Not Found</h3>
              <p className="text-gray-400">Unable to load project information.</p>
            </div>
          )}
        </div>

        {/* Footer */}

      </div>
    </div>
  )
}

// --- Main Component ---
export default function ProjectDashboard() {
  // Get user data from AuthContext
  const { user } = useAuth()

  const [currentView, setCurrentView] = useState<"table" | "kanban">("table")

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
    priority: "medium",
  })
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch manager projects function
  const fetchManagerProjects = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching projects for manager:", user.id)
  const projectsData = await getProjectsForManagers(String(user.id))
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
  const handleUpdatedProjectStatus = async (projectId: number, newStatus: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await updateProjectStatus(projectId, newStatus)

      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)))

      console.log("Project status updated successfully")
    } catch (error) {
      console.error("Error updating project status:", error)
      setError("Failed to update project status. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

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

  // Pagination logic
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredProjects])

  const handleViewChange = (view: "table" | "kanban") => {
    setCurrentView(view)
    if (view === "kanban") {
      // Navigate to kanban view page
      window.location.href = "/dashboard/manager/projectkanbanview"
    }
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

  const editProject = editStatusProjectId ? (projects.find((p) => p.id === editStatusProjectId) ?? null) : null

  // Show authentication error if user is not logged in
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-none mx-auto">
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
    <div className="w-full relative top-[30px] max-w-full">

      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8 ml-2">
          <h1
  className="
    font-roboto
    font-semibold
    text-[20px]
    leading-[28px]
    tracking-[0px]
    align-middle
    text-white
    mb-2
  "
>
  Project Dashboard
</h1>

          <p
  className="
    font-roboto
    font-normal
    text-[14px]
    leading-[20px]
    tracking-[0px]
    align-middle
    text-white
  "
>
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
        <div
          className="
            mb-8
           bg-black/30
          rounded-[24px]
            shadow-lg
             border border-[#FFFFFF4D]
            p-[25px]
          "
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar and View Toggle Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 w-full">
              {/* Search Bar */}
  <div className="relative flex-1 w-full h-[44px]">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 z-10" />
  <input
    type="text"
    placeholder="Search projects by name, ID, or description..."
    style={{ backgroundColor: colors.black.transparent40 }}
    className="
      w-full h-[44px]
      pl-[48px] pr-[16px] py-[12px]
      rounded-[16px]
      backdrop-blur-[100px]
      text-white
      focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
      transition-all duration-300
      shadow-sm focus:shadow-md

      placeholder:font-inter
      placeholder:font-medium
      placeholder:text-[14px]
      placeholder:leading-[20px]
      placeholder:tracking-[0px]
      placeholder:align-middle
      placeholder:text-gray-400
    "
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

            </div>

            {/* Refresh Button */}
        <button
  onClick={refreshData}
  disabled={isLoading}
  className="
    group inline-flex items-center justify-center gap-2
    w-[122.52px] h-[46px]
    px-[25px] py-[13px]
    rounded-[99px]
    bg-[#0CA9F6]
    border border-[#57B5E7E5]
    text-white text-sm font-medium
    transition-all duration-300 ease-in-out
    shadow-lg hover:shadow-xl
    transform hover:scale-105 hover:-translate-y-0.5
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  "
>
  <RefreshCw
    className={`w-4 h-4 transition-transform duration-300 ${
      isLoading ? "animate-spin" : "group-hover:rotate-180"
    }`}
  />
  Refresh
</button>


          </div>
        </div>

        {/* Table Container */}
        <div
          className="
            backdrop-blur-xl
            rounded-2xl
            shadow-lg
            border border-white/10
            overflow-hidden"
        >

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-gray-600 text-lg">Loading your assigned projects...</p>
            </div>
          ) : (
            <div className="overflow-x-auto ">
              <table className="min-w-full divide-y divide-emerald-200 ">
<thead
  className="
    bg-black/40
    rounded-tl-[20px] rounded-tr-[20px]
    shadow-lg
    border-b border-b-white/20
    overflow-hidden
    p-[1px]
  "
>
  <tr className="h-[73px]">
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] uppercase">
      Name
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] uppercase">
      Description
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] uppercase">
      Start Date
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] uppercase">
      End Date
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] min-w-[120px] uppercase">
      Status
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] min-w-[200px] uppercase">
      Actions
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] uppercase">
      View Team
    </th>
    <th className="whitespace-nowrap px-6 py-4 text-left font-roboto font-semibold text-[14px] leading-[20px] text-white tracking-[0px] uppercase">
      Settings
    </th>
  </tr>
</thead>


<tbody
  className="
    bg-black/30
    rounded-b-2xl
    shadow-lg
    overflow-hidden
    divide-y divide-white/10
    backdrop-blur-xl
  "
>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-gray-300 text-lg font-medium mb-1">
                            {error ? "Unable to load projects" : "No projects found"}
                          </p>
                          <p className="text-gray-400">
                            {error
                              ? "Please try refreshing the page"
                              : "You have no assigned projects matching the current filters"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map((project) => (
                      <tr key={project.id.toString()} className="transition-all duration-300">
                        {/* Project Name */}
                    <td className="px-6 py-6">
      <div className="flex items-center gap-3">
        {/* Project Logo */}
        {project.logo ? (
          <img
            src={project.logo}
            alt={`${project.name} logo`}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {

              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${project.name}&backgroundColor=3b82f6,8b5cf6,10b981,f59e0b,ef4444`
            }}
          />
        ) : (
          // Default avatar if no logo
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-sm">
            <span className="text-white font-semibold text-sm">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Project Name */}
        <span className="text-lg font-semibold text-white leading-tight hover:underline decoration-white/60">
          {project.name}
        </span>
      </div>
    </td>

                        {/* Description */}
                       <td className="px-6 py-6">
  <p className="font-roboto font-normal text-[14px] leading-[20px] text-[rgba(164,167,174,1)] max-w-xs">
    {truncateByWords(project.description, 30)}
  </p>
</td>

                        {/* Start Date */}
                       <td className="px-6 py-6">
  <span className="font-roboto font-normal text-[14px] leading-[20px] text-[rgba(164,167,174,1)]">
    {new Date(project.startDate).toLocaleDateString()}
  </span>
</td>

                        {/* End Date */}
                    <td className="px-6 py-6">
  <span className="font-roboto font-normal text-[14px] leading-[20px] text-[rgba(164,167,174,1)]">
    {new Date(project.endDate).toLocaleDateString()}
  </span>
</td>

                        {/* Status */}
<td className="px-6 py-4 align-middle">
  {project.status ? (
    <span
      className={`inline-flex items-center justify-center
        min-w-[88px] h-[26px]
        px-[9px] py-[5px]
        rounded-full border border-white/20
        bg-white backdrop-blur-[5px]
        text-[12px] leading-4 tracking-[0px]
        font-montserrat font-semibold
        whitespace-nowrap align-middle
        text-[#15803D]`}
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
      className={`inline-flex items-center justify-center
        min-w-[88px] h-[26px]
        px-[9px] py-[5px]
        rounded-full border border-white/20
        bg-[#15803D] backdrop-blur-[5px]
        text-[12px] leading-4 tracking-[0px]
        font-montserrat font-semibold
        whitespace-nowrap align-middle
        text-white`}
    >
      {project.isActive ? "Active" : "Inactive"}
    </span>
  )}
</td>


                        {/* Actions - Assign Team */}
                        <td className="px-6 py-6">
                          <div className="flex flex-row gap-2">
                 <button
  className="px-4 py-2 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 bg-[#0CA9F6] border border-[#57B5E7E5]"
  onClick={() => setAssignTeamProjectId(String(project.id))}
>
  Assign Team
</button>
                          </div>
                        </td>

                        {/* Actions - View Team */}
  <td className="px-6 py-6">
  <div className="flex items-center gap-2">
    <button
      className="group inline-flex items-center justify-center text-white rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110"
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        padding: "1px",
      }}
      onClick={() => setViewTeamProjectId(project.id)}
    >
      <Users style={{ width: "14.58px", height: "14px" }} />
    </button>
  </div>
</td>



                        {/* Actions - Edit / Delete */}
                       <td className="px-6 py-6">
  <div className="flex items-center gap-2">
    {/* Edit */}
    <button
  className="group inline-flex items-center justify-center w-8 h-8 text-white rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 border"
  style={{ borderColor: "rgba(255, 255, 255, 0.4)", borderWidth: "1px" }}
  onClick={() => setEditStatusProjectId(project.id)}
>
  <img
    src="/images/I-169.svg"
    alt="Edit"
    style={{ width: "17.58px", height: "17px" }}
  />
</button>


    {/*View */}
<button
  className="group inline-flex items-center justify-center w-8 h-8 text-white rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 border"
  style={{ borderColor: "rgba(255, 255, 255, 0.4)", borderWidth: "1px" }}
  onClick={() => window.location.href = `/dashboard/manager/projects/${project.id}`}
  title="View project details"
>
  <img
    src="/images/Eye.svg"
    alt="View Details"
    style={{ width: "17.58px", height: "17px" }}
  />
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

        {/* Pagination */}
        {!isLoading && filteredProjects.length > itemsPerPage && (
          <div className="flex justify-center my-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(Math.ceil(filteredProjects.length / itemsPerPage), 1)}
              onPageChange={setCurrentPage}
              colors={colors}
            />
          </div>
        )}

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
                  priority: "medium",
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
          onUpdate={handleUpdatedProjectStatus}
        />
      </div>
    </div>
  )
}
