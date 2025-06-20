"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Edit, Trash2, Eye, RefreshCw, AlertCircle, ChevronDown, UserCheck, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"

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
    case "planning":
    case "pending":
      return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200 ring-1 ring-blue-200 shadow-sm"
    case "on-hold":
    case "blocked":
      return "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 ring-1 ring-amber-200 shadow-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8 ml-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage and track your project progress</p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-100 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by name or description..."
                className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md bg-white/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white/80 border border-emerald-200 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 min-w-[140px] shadow-sm focus:shadow-md"
                  >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              <button
                type="button"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                onClick={() => router.push("/dashboard/admin/addProject")}
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl shadow-lg border border-white/50 overflow-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-gray-600 text-lg">Loading projects...</p>
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
                      Manager
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-emerald-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-gray-600 text-lg font-medium mb-1">No projects found</p>
                          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project, index) => (
                      <tr
                        key={project.id}
                        className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/50 transition-all duration-300 ${
                          index % 2 === 0 ? "bg-white/60" : "bg-emerald-50/30"
                        }`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">{project.name}</h3>
                            <div className="flex items-center gap-2">
                              {project.budget && (
                                <span className="text-gray-500 text-sm">${project.budget.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{project.description}</p>
                        </td>
                        <td className="px-6 py-6">
                          {project.manager ? (
                            <span className="font-semibold text-gray-900">{project.manager.name}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-sm">No manager</span>
                              <button
                                className="ml-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full text-xs font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setAssignManagerProjectId(project.id)}
                                disabled={isAssigning}
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{project.completion || 0}%</span>
                            </div>
                            <div className="w-full bg-emerald-200/50 rounded-full h-2 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                                style={{ width: `${project.completion || 0}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <button className="group inline-flex items-center justify-center w-8 h-8 text-teal-600 hover:text-white bg-teal-50 hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="group inline-flex items-center justify-center w-8 h-8 text-amber-600 hover:text-white bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProject(project.id)}
                              disabled={isDeleting === project.id}
                              className="group inline-flex items-center justify-center w-8 h-8 text-rose-600 hover:text-white bg-rose-50 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeleting === project.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
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
