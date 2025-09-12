"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { Search, Trash2, RefreshCw, AlertCircle, Plus, X, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { colors } from "@/colors"
import Pagination from "../pagination"

interface Manager {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  priority: string
  budget?: number
  completion?: number
  manager?: Manager
}

// --- Helpers ---
const generateAvatar = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=a7f3d0,bbf7d0,d1fae5,ecfdf5,f0fdfa`
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "critical":
      return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 ring-1 ring-red-200 shadow-sm"
    case "high":
      return "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200 ring-1 ring-orange-200 shadow-sm"
    case "medium":
      return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200 shadow-sm"
    case "low":
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
  }
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "in-progress":
      return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200 shadow-sm"
    case "completed":
      return "bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border-teal-200 ring-1 ring-teal-200 shadow-sm"
    case "cancelled":
      return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 ring-1 ring-red-200 shadow-sm"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-1 ring-slate-200 shadow-sm"
  }
}

// --- Edit Project Modal Component ---
interface EditProjectModalProps {
  open: boolean
  onClose: () => void
  onUpdate: (projectId: string, updatedData: Partial<Project>) => void
  project: Project | null
  isUpdating?: boolean
}

function EditProjectModal({ open, onClose, onUpdate, project, isUpdating = false }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        startDate: project.startDate ? project.startDate.split("T")[0] : "",
        endDate: project.endDate ? project.endDate.split("T")[0] : "",
        status: project.status || "",
      })
      setErrors({})
    }
  }, [project])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Project description is required"
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !project) return

    // Create update object with only non-empty fields that have actually changed
    const updateData: Partial<Project> = {}

    // Only include fields that are not empty and different from original
    if (formData.name.trim() && formData.name.trim() !== project.name) {
      updateData.name = formData.name.trim()
    }

    if (formData.description.trim() && formData.description.trim() !== project.description) {
      updateData.description = formData.description.trim()
    }

    if (formData.startDate && formData.startDate !== (project.startDate ? project.startDate.split("T")[0] : "")) {
      updateData.startDate = formData.startDate
    }

    if (formData.endDate && formData.endDate !== (project.endDate ? project.endDate.split("T")[0] : "")) {
      updateData.endDate = formData.endDate
    }

    if (formData.status && formData.status !== project.status) {
      updateData.status = formData.status
    }

    // Only proceed if there are actual changes
    if (Object.keys(updateData).length === 0) {
      alert("No changes detected.")
      return
    }

    onUpdate(project.id, updateData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

    if (!open || !project) return null

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 custom-scrollbar"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: `2px solid ${colors.primary.hex}40`,
          }}
        >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.12);
            border-radius: 8px;
            border: 2px solid rgba(255,255,255,0.08);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.18);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.12) transparent;
          }
        `}</style>
          {/* Header */}
          <div
            className="px-8 py-6 border-b relative overflow-hidden rounded-t-3xl"
            // style={{
            //   background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
            //   color: "#fff",
            // }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">Edit Project</h2>
                <p className="text-white/80 text-sm">Update project information</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110"
                disabled={isUpdating}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="px-8 py-6 space-y-6 text-white">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.primary.hex }}></div>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
                  style={{
                    borderColor: errors.name ? "#ef4444" : colors.primary.hex,
                  }}
                  placeholder="Enter project name"
                  disabled={isUpdating}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.secondary.hex }}></div>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none resize-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
                  style={{
                    borderColor: errors.description ? "#ef4444" : colors.primary.hex,
                  }}
                  placeholder="Enter project description"
                  disabled={isUpdating}
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.accent.hex }}></div>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
                  style={{
                    borderColor: colors.primary.hex,
                  }}
                  disabled={isUpdating}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.highlight.hex }}></div>
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
                  style={{
                    borderColor: errors.endDate ? "#ef4444" : colors.primary.hex,
                  }}
                  disabled={isUpdating}
                />
                {errors.endDate && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.endDate}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.accent.hex }}></div>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-300 font-medium bg-transparent text-white placeholder-gray-300"
                  style={{
                    borderColor: colors.primary.hex,
                    background: "rgba(0,0,0,0.2)",
                  }}
                  disabled={isUpdating}
                >
                  <option value="">Select Status</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-6 border-t rounded-b-3xl flex gap-4"
              // style={{
              //   background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
              //   borderColor: `${colors.primary.hex}40`,
              // }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 transform hover:scale-105 text-white"
                style={{
                  borderColor: "#fff",
                }}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || Object.keys(errors).length > 0}
                className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 disabled:transform-none shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.hex}, ${colors.secondary.hex})`,
                }}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
}

// --- Assign Manager Modal Component ---
interface AssignManagerModalProps {
  open: boolean
  onClose: () => void
  onAssign: (manager: Manager) => void
  project: Project | null
  managers: Manager[]
  isAssigning?: boolean
}

function AssignManagerModal({
  open,
  onClose,
  onAssign,
  project,
  managers,
  isAssigning = false,
}: AssignManagerModalProps) {
  const [assigningManagerId, setAssigningManagerId] = useState<string | null>(null)

  if (!open || !project) return null

  const handleAssign = async (manager: Manager) => {
    setAssigningManagerId(manager.id)
    await onAssign(manager)
    setAssigningManagerId(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div
          className="p-6"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            color: "#fff",
          }}
        >
          <h2 className="text-2xl font-bold">Assign Manager to {project.name}</h2>
          <p className="mt-1 text-white">Select a manager to oversee this project</p>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {managers.map((manager) => (
              <div
                key={manager.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                onClick={() => !assigningManagerId && handleAssign(manager)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                    }}
                  >
                    {manager.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                    <p className="text-sm text-gray-600">{manager.email}</p>
                    <p className="text-xs text-gray-500">{manager.phone}</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                    color: "#fff",
                  }}
                  disabled={!!assigningManagerId}
                >
                  {assigningManagerId === manager.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              background: "#fff",
              color: colors.primary.hex,
              border: `1px solid ${colors.primary.hex}`,
            }}
            disabled={!!assigningManagerId}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function ProjectDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [statusOpen, setStatusOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement | null>(null)
  const [assignManagerProjectId, setAssignManagerProjectId] = useState<string | null>(null)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const response = await axiosInstance.get("/projects")
        setProjects(response.data || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Fetch managers from API
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await axiosInstance.get("/user?role=manager")
        const managersData = Array.isArray(response.data) ? response.data : [response.data]
        setManagers(managersData.filter(Boolean))
      } catch (error) {
        console.error("Error fetching managers:", error)
        setManagers([])
      }
    }
    fetchManagers()
  }, [])

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      // Normalize status by removing dashes, so "in-progress" and "inprogress" both match
      const projectStatus = project.status?.toLowerCase().replace(/-/g, "")
      const filterStatus = statusFilter.toLowerCase().replace(/-/g, "")
      const matchesStatus = statusFilter === "all" || projectStatus === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [projects, searchTerm, statusFilter])

  // Pagination logic
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Update project with API call
  const updateProject = async (projectId: string, updatedData: Partial<Project>) => {
    setIsUpdating(true)
    try {
      // Make PATCH request to update project
      const response = await axiosInstance.patch(`/projects/${projectId}`, updatedData)

      // Update local state on success
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updatedData } : p)))

      setEditProjectId(null)
      console.log(`Project updated successfully!`)
      // You could add a success notification here
    } catch (error) {
      console.error("Error updating project:", error)
      // You could add an error notification here
      alert("Failed to update project. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Assign manager to project with API call
  const assignManager = async (projectId: string, manager: Manager) => {
    setIsAssigning(true)
    try {
      // Make PATCH request to assign manager
      await axiosInstance.patch(`/projects/${projectId}`, {
        manager: manager.id,
      })
      // Update local state on success
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, manager } : p)))
      setAssignManagerProjectId(null)
      // You could add a success notification here
      console.log(`Manager ${manager.name} assigned to project successfully!`)
    } catch (error) {
      console.error("Error assigning manager:", error)
      // You could add an error notification here
      alert("Failed to assign manager. Please try again.")
    } finally {
      setIsAssigning(false)
    }
  }

  // Delete project with API call
  const deleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }
    setIsDeleting(projectId)
    try {
      // Make DELETE request to delete project
      await axiosInstance.delete(`/projects/${projectId}`)
      // Remove project from local state on success
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      // You could add a success notification here
      console.log(`Project deleted successfully!`)
    } catch (error) {
      console.error("Error deleting project:", error)
      // You could add an error notification here
      alert("Failed to delete project. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  const currentProject = assignManagerProjectId ? projects.find((p) => p.id === assignManagerProjectId) : null
  const editProject = editProjectId ? projects.find((p) => p.id === editProjectId) : null

  // Refresh projects list (used by header Refresh button)
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get("/projects")
      setProjects(response.data || [])
    } catch (error) {
      console.error("Error refreshing projects:", error)
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  // Close custom status dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Action Bar - match Manager header styling */}
        <div className="mb-8 flex items-center justify-between gap-4">
          {/* Left: Heading */}
          <div className="flex flex-col gap-1 md:gap-2 justify-center flex-shrink-0" style={{ minWidth: 220 }}>
            <h1
              className="font-bold text-white font-sans not-italic text-2xl leading-9 tracking-normal [font-family:Montserrat,sans-serif] [font-weight:700] [vertical-align:middle] [background-clip:text]"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontStyle: 'normal',
                fontSize: '20px',
                lineHeight: '36px',
                letterSpacing: '0px',
                WebkitBackgroundClip: 'text',
                verticalAlign: 'middle',
              }}
            >
              Project Dashboard
            </h1>
            <p
              className="font-normal align-middle text-[#E5E5E5] text-opacity-75  font-montserrat not-italic text-sm leading-5 tracking-normal [font-family:Montserrat,sans-serif] [font-weight:400] [background-clip:text]"
            >
              Manage and track your project progress
            </p>
          </div>

          {/* Center: Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg" style={{ marginLeft: '90px' }}>
              <Search
                className="absolute text-[#9CA3AF] left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search projects by name or description"
                className="w-[396px] h-[38px] rounded-[16px] border border-[#FFFFFF4D] bg-[#0000004D] opacity-100 px-[41px] py-[9px]   pr-[17px] text-[#9CA3AF] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]/30 transition-all duration-300 shadow-sm mx-auto"
                style={{
                  borderWidth: 1,
                  background: '#0000004D',
                  borderColor: '#FFFFFF4D',
                  borderRadius: '16px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  paddingLeft: '41px',
                  paddingRight: '17px',
                  height: '38px',
                  width: '396px',
                  opacity: 1,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Right: status filter and add */}
          <div className="flex flex-row items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className="text-xs text-white sm:text-sm px-[24px] py-[8px] rounded-full border opacity-100 focus:outline-none focus:ring-2 focus:ring-[#0CA9F6]/30 transition-all duration-300 shadow-sm inline-flex items-center gap-2"
                style={{
                  borderWidth: 1,
                  background: '#0000004D',
                  borderColor: '#FFFFFF4D',
                }}
              >
                {statusFilter === 'all'
                  ? 'All Status'
                  : statusFilter === 'in-progress'
                  ? 'In Progress'
                  : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
              {statusOpen && (
                <div
                  className="absolute right-0 mt-2 z-20 w-48 rounded-2xl border shadow-lg backdrop-blur-md"
                  style={{
                    background: '#0000004D',
                    borderColor: '#FFFFFF4D',
                  }}
                >
                  {[
                    { value: 'all', label: 'All Status' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                      onClick={() => {
                        setStatusFilter(opt.value)
                        setStatusOpen(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                background: colors.primary.hex,
                color: '#fff',
                border: `1px solid ${colors.primary.hex}`,
              }}
              onClick={() => router.push("/dashboard/admin/addProject")}
            >
              <Plus className="w-4 h-4 text-white" />
              Add Project
            </button>
          </div>
        </div>

        {/* Table Container - match Manager cards background and screenshot */}
        <div
          className="relative rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-md"
          style={{
            background: "#0000005D",
            borderColor: "#FFFFFF4D",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-white/10 border border-white/20">
                <RefreshCw className="w-6 h-6 animate-spin text-white" />
              </div>
              <p className="text-lg text-white/90">Loading projects...</p>
            </div>
          ) : (
            <div className="overflow-x-hidden">
              <table className="min-w-full table-fixed divide-y divide-white/10">
                <thead className="backdrop-blur-md bg-white/5">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left w-[180px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]"
                        >
                          Name
                        </span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[260px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]"
                        >
                          Description
                        </span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[110px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px] whitespace-nowrap"
                        >
                          Start Date
                        </span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[110px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px] whitespace-nowrap"
                        >
                          End Date
                        </span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[140px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]"
                        >
                          Status
                        </span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[160px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]"
                        >
                          Manager
                        </span>
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left w-[120px]">
                      <div
                        className="inline-flex items-start w-full px-4 py-3 rounded-[16px] border text-[14px] font-semibold tracking-[0.7px] text-left bg-[#0000004D] border-[#FFFFFF4D] text-white"
                      >
                        <span
                          className="font-[Montserrat] font-semibold align-middle text-[14px] leading-[20px] tracking-[0.7px]"
                        >
                          Actions
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-400" style={{ borderColor: '#BDBDBD' }}>
                  {paginatedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-white/70" />
                          </div>
                          <p className="text-white/90 text-lg font-medium mb-1">No projects found</p>
                          <p className="text-white/60">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedProjects.map((project, index) => (
                      <tr
                        key={project.id}
                        className="transition-colors duration-300 bg-transparent hover:bg-white/5"
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <h3
                              className="text-xs sm:text-sm font-normal leading-tight break-words whitespace-normal"
                              style={{ color: "#6AD0F4", fontWeight: 400, wordBreak: 'break-word', fontSize: '13px' }}
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
                            <div className="flex items-center gap-2">
                              {project.budget && (
                                <span className="text-sm text-white/70">
                                  ${project.budget.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm leading-relaxed break-words whitespace-normal max-w-2xl" style={{ color: "#A8A8A8" }}>
                            {project.description}
                          </p>
                        </td>
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
                          {project.status ? (
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm whitespace-nowrap"
                              style={(() => {
                                const status = project.status.toLowerCase().replace(/\s/g, "");
                                if (status === "active") {
                                  return { background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0" };
                                }
                                if (status === "inprogress" || status === "in-progress") {
                                  return { background: "#FDE68A", color: "#92400E", border: "1px solid #FCD34D" };
                                }
                                if (status === "completed") {
                                  return { background: "#99F6E4", color: "#115E59", border: "1px solid #5EEAD4" };
                                }
                                if (status === "onhold" || status === "on-hold") {
                                  return { background: "#FECACA", color: "#9F1239", border: "1px solid #FDA4AF" };
                                }
                                return { background: "#E5E7EB", color: "#111827", border: "1px solid #D1D5DB" };
                              })()}
                            >
                              {(() => {
                                const status = project.status.toLowerCase()
                                if (status === "inprogress" || status === "in-progress") return <span style={{whiteSpace:'nowrap'}}>In Progress</span>;
                                if (status === "completed") return <span style={{whiteSpace:'nowrap'}}>Completed</span>;
                                if (status === "onhold" || status === "on-hold") return "On Hold"
                                return status.charAt(0).toUpperCase() + status.slice(1)
                              })()}
                            </span>
                          ) : (
                            <span className="text-xs text-white/60">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          {project.manager ? (
                            <span className="font-semibold text-white break-words whitespace-normal">
                              {project.manager.name}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/60">
                                No manager
                              </span>
                              <button
                                className="ml-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setAssignManagerProjectId(project.id)}
                                disabled={isAssigning}
                                style={{
                                  background: "#0000004D",
                                  color: "#fff",
                                  border: "1px solid #FFFFFF4D",
                                }}
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditProjectId(project.id)}
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1 border"
                              style={{
                                background: "#0000004D",
                                borderColor: "#FFFFFF4D",
                                color: "#BDBDBD", // light gray
                              }}
                              title="Edit"
                            >
                              {/* Custom pencil with underline icon, matching the provided image */}
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                  <rect x="5" y="17" width="12" height="2" rx="1" fill="#BDBDBD" />
                                  <path d="M15.5 4.5L17.5 6.5C17.7761 6.77614 17.7761 7.22386 17.5 7.5L8.5 16.5L5 17L5.5 13.5L14.5 4.5C14.7761 4.22386 15.2239 4.22386 15.5 4.5Z" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </g>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteProject(project.id)}
                              disabled={isDeleting === project.id}
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed border"
                              style={{
                                background: "#0000004D",
                                borderColor: "#FFFFFF4D",
                                color: "#fff",
                              }}
                            >
                              {isDeleting === project.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-white" />
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
          {/* Footer inside container: showing count + pagination */}
          {!isLoading && (
            <div
              className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t"
              style={{ borderColor: "#FFFFFF26", background: "rgba(0,0,0,0.15)" }}
            >
              <div className="text-sm" style={{ color: "#E5E7EB" }}>
                {(() => {
                  const total = filteredProjects.length
                  const start = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
                  const end = Math.min(currentPage * itemsPerPage, total)
                  return `Showing ${start} to ${end} of ${total} results`
                })()}
              </div>
              {filteredProjects.length > itemsPerPage && (
                <div className="w-full md:w-auto ml-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.max(Math.ceil(filteredProjects.length / itemsPerPage), 1)}
                    onPageChange={setCurrentPage}
                    colors={colors}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Project Modal */}
        <EditProjectModal
          open={!!editProjectId}
          onClose={() => setEditProjectId(null)}
          onUpdate={updateProject}
          project={editProject ?? null}
          isUpdating={isUpdating}
        />

        {/* Assign Manager Modal */}
        <AssignManagerModal
          open={!!assignManagerProjectId}
          onClose={() => setAssignManagerProjectId(null)}
          onAssign={(manager) => assignManager(assignManagerProjectId!, manager)}
          project={currentProject ?? null}
          managers={managers}
          isAssigning={isAssigning}
        />
      </div>
    </div>
  )
}
