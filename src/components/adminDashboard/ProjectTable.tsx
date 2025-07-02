"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Edit, Trash2, Eye, RefreshCw, AlertCircle, ChevronDown, UserCheck, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import { colors } from "@/colors"
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
  const [assigningManagerId, setAssigningManagerId] = useState<string | null>(null);

  if (!open || !project) return null

  const handleAssign = async (manager: Manager) => {
    setAssigningManagerId(manager.id);
    await onAssign(manager);
    setAssigningManagerId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
          <h2 className="text-2xl font-bold">Assign Manager to {project.name}</h2>
          <p className="text-emerald-200 mt-1">Select a manager to oversee this project</p>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {manager.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                    <p className="text-sm text-gray-600">{manager.email}</p>
                    <p className="text-xs text-gray-500">{manager.phone}</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignManagerProjectId, setAssignManagerProjectId] = useState<string | null>(null)

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
      const matchesStatus = statusFilter === "all" || project.status?.toLowerCase() === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchTerm, statusFilter])

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Project Dashboard
          </h1>
          <p
            className="text-lg"
            style={{
              background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Manage and track your project progress
          </p>
        </div>

        {/* Action Bar */}
        <div
          className="mb-8 rounded-2xl shadow-lg border p-6"
          style={{
            background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
            color: '#fff',
            borderColor: colors.primary.hex,
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: colors.accent.hex }}
              />
              <input
                type="text"
                placeholder="Search projects by name or description..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl focus:ring-2 transition-all duration-300 shadow-sm focus:shadow-md"
                style={{
                  background: '#fff',
                  color: colors.primary.hex,
                  border: `1px solid ${colors.primary.hex}`,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-2xl px-4 py-3 pr-10 min-w-[140px] shadow-sm focus:shadow-md"
                  style={{
                    background: '#fff',
                    color: colors.primary.hex,
                    border: `1px solid ${colors.primary.hex}`,
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: colors.secondary.hex }} />
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                  color: '#fff',
                  border: `1px solid ${colors.primary.hex}`,
                }}
                onClick={() => router.push("/dashboard/admin/addProject")}
              >
                <Plus className="w-4 h-4" style={{ color: colors.highlight.hex }} />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div
          className="rounded-2xl shadow-lg border overflow-hidden"
          style={{
            background: '#fff',
            borderColor: colors.primary.hex,
          }}
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                style={{ background: colors.accent.hex }}
              >
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: colors.primary.hex }} />
              </div>
              <p className="text-lg" style={{ color: colors.primary.hex }}>Loading projects...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: colors.primary.hex }}>
                <thead style={{ background: colors.accent.hex }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Manager</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Progress</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary.hex }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-600 text-lg font-medium mb-1">No projects found</p>
                          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project, index) => (
                      <tr
                        key={project.id}
                        className={`bg-white transition-all duration-300 hover:bg-gradient-to-r hover:from-[${colors.primary.hex}] hover:to-[${colors.secondary.hex}] hover:text-white`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold leading-tight" style={{ color: colors.primary.hex }}>{project.name}</h3>
                            <div className="flex items-center gap-2">
                              {project.budget && (
                                <span className="text-sm" style={{ color: colors.secondary.hex }}>${project.budget.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm leading-relaxed max-w-xs" style={{ color: colors.secondary.hex }}>{project.description}</p>
                        </td>
                        <td className="px-6 py-6">
                          {project.status ? (
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
                              style={{
                                background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                color: '#fff',
                              }}
                            >
                              {(() => {
                                const status = project.status.toLowerCase();
                                if (status === "inprogress" || status === "in-progress") return "In Progress";
                                if (status === "onhold" || status === "on-hold") return "On Hold";
                                return status.charAt(0).toUpperCase() + status.slice(1);
                              })()}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: colors.secondary.hex }}>—</span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          {project.manager ? (
                            <span className="font-semibold" style={{ color: colors.primary.hex }}>{project.manager.name}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm" style={{ color: colors.secondary.hex }}>No manager</span>
                              <button
                                className="ml-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setAssignManagerProjectId(project.id)}
                                disabled={isAssigning}
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                                  color: '#fff',
                                  border: `1px solid ${colors.primary.hex}`,
                                }}
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium" style={{ color: colors.primary.hex }}>{project.completion || 0}%</span>
                            </div>
                            <div className="w-full rounded-full h-2 shadow-inner" style={{ background: colors.accent.hex }}>
                              <div
                                className="h-2 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                                style={{
                                  background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex})`,
                                  width: `${project.completion || 0}%`,
                                }}
                              >
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, #fff3, transparent)', animation: 'pulse 2s infinite' }}></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1"
                              style={{
                                background: colors.highlight.hex,
                                color: colors.primary.hex,
                              }}
                            >
                              <Edit className="w-4 h-4" style={{ color: colors.primary.hex }} />
                            </button>
                            <button
                              onClick={() => deleteProject(project.id)}
                              disabled={isDeleting === project.id}
                              className="group inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: colors.warning.hex,
                                color: '#fff',
                              }}
                            >
                              {isDeleting === project.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#fff' }} />
                              ) : (
                                <Trash2 className="w-4 h-4" style={{ color: '#fff' }} />
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
