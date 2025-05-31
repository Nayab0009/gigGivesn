"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Edit, Trash2, Eye, MoreHorizontal, Plus, RefreshCw, Phone, Mail, Users, Calendar, Star, TrendingUp, User, Building2 } from 'lucide-react'
import { useRouter } from "next/navigation";
// --- Types for Managers Table ---
interface Manager {
  id: string
  name: string
  email: string
  phone: string
  department: string
  experience: string
  status: "Active" | "Inactive" | "On Leave"
  projectsHandled: {
    id: string
    title: string
    priority: "High" | "Medium" | "Low"
    status: "Active" | "Completed" | "On Hold"
    progress: number
  }[]
  avatar: string
  joinDate: string
  totalProjects: number
  activeProjects: number
  completedProjects: number
}

const STATUS_CONFIG = {
  Active: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Inactive: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  "On Leave": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
}

const PRIORITY_CONFIG = {
  High: { 
    bg: "bg-red-50", 
    text: "text-red-700", 
    border: "border-red-200",
    dot: "bg-red-500"
  },
  Medium: { 
    bg: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-200",
    dot: "bg-amber-500"
  },
  Low: { 
    bg: "bg-emerald-50", 
    text: "text-emerald-700", 
    border: "border-emerald-200",
    dot: "bg-emerald-500"
  },
}

// Generate beautiful avatar URLs
const generateAvatar = (name: string, index: number) => {
  const avatarStyles = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
  ]
  return avatarStyles[index % avatarStyles.length]
}

export default function EnhancedManagersTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [managers, setManagers] = useState<Manager[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedManager, setExpandedManager] = useState<string | null>(null)
  const router = useRouter();
  useEffect(() => {
    const fetchManagers = async () => {
      setTimeout(() => {
        // Enhanced mock data for managers
        setManagers([
          {
            id: "MGR-001",
            name: "Sarah Chen",
            email: "sarah.chen@company.com",
            phone: "+1 (555) 123-4567",
            department: "Engineering",
            experience: "8 years",
            status: "Active",
            joinDate: "2019-03-15",
            avatar: generateAvatar("Sarah Chen", 0),
            totalProjects: 4,
            activeProjects: 3,
            completedProjects: 1,
            projectsHandled: [
              { id: "PRJ-001", title: "E-commerce Platform Redesign", priority: "High", status: "Active", progress: 75 },
              { id: "PRJ-008", title: "Security Audit Implementation", priority: "High", status: "Active", progress: 55 },
              { id: "PRJ-003", title: "API Integration Suite", priority: "Medium", status: "Active", progress: 30 },
              { id: "PRJ-006", title: "Customer Portal v2.0", priority: "Low", status: "Completed", progress: 100 }
            ]
          },
          {
            id: "MGR-002",
            name: "Michael Rodriguez",
            email: "michael.rodriguez@company.com",
            phone: "+1 (555) 234-5678",
            department: "Product",
            experience: "6 years",
            status: "Active",
            joinDate: "2020-07-22",
            avatar: generateAvatar("Michael Rodriguez", 1),
            totalProjects: 3,
            activeProjects: 2,
            completedProjects: 1,
            projectsHandled: [
              { id: "PRJ-002", title: "Mobile Banking App", priority: "High", status: "Active", progress: 45 },
              { id: "PRJ-007", title: "Data Analytics Dashboard", priority: "Medium", status: "Active", progress: 25 },
              { id: "PRJ-010", title: "User Experience Research", priority: "Medium", status: "Completed", progress: 100 }
            ]
          },
          {
            id: "MGR-003",
            name: "Emma Watson",
            email: "emma.watson@company.com",
            phone: "+1 (555) 345-6789",
            department: "Operations",
            experience: "10 years",
            status: "Active",
            joinDate: "2017-01-10",
            avatar: generateAvatar("Emma Watson", 2),
            totalProjects: 2,
            activeProjects: 1,
            completedProjects: 1,
            projectsHandled: [
              { id: "PRJ-004", title: "Quality Assurance Sprint", priority: "High", status: "Active", progress: 90 },
              { id: "PRJ-009", title: "Process Optimization", priority: "Medium", status: "Completed", progress: 100 }
            ]
          },
          {
            id: "MGR-004",
            name: "David Kim",
            email: "david.kim@company.com",
            phone: "+1 (555) 456-7890",
            department: "Infrastructure",
            experience: "12 years",
            status: "Active",
            joinDate: "2015-09-08",
            avatar: generateAvatar("David Kim", 3),
            totalProjects: 2,
            activeProjects: 0,
            completedProjects: 2,
            projectsHandled: [
              { id: "PRJ-005", title: "Cloud Infrastructure Migration", priority: "Medium", status: "On Hold", progress: 60 },
              { id: "PRJ-011", title: "Server Maintenance", priority: "Low", status: "Completed", progress: 100 }
            ]
          },
          {
            id: "MGR-005",
            name: "Lisa Park",
            email: "lisa.park@company.com",
            phone: "+1 (555) 567-8901",
            department: "Design",
            experience: "7 years",
            status: "On Leave",
            joinDate: "2018-11-12",
            avatar: generateAvatar("Lisa Park", 0),
            totalProjects: 1,
            activeProjects: 1,
            completedProjects: 0,
            projectsHandled: [
              { id: "PRJ-012", title: "Brand Identity Refresh", priority: "Medium", status: "Active", progress: 40 }
            ]
          },
          {
            id: "MGR-006",
            name: "Alex Johnson",
            email: "alex.johnson@company.com",
            phone: "+1 (555) 678-9012",
            department: "Marketing",
            experience: "5 years",
            status: "Active",
            joinDate: "2021-04-18",
            avatar: generateAvatar("Alex Johnson", 1),
            totalProjects: 3,
            activeProjects: 2,
            completedProjects: 1,
            projectsHandled: [
              { id: "PRJ-013", title: "Digital Marketing Campaign", priority: "High", status: "Active", progress: 65 },
              { id: "PRJ-014", title: "Social Media Strategy", priority: "Medium", status: "Active", progress: 80 },
              { id: "PRJ-015", title: "Content Management System", priority: "Low", status: "Completed", progress: 100 }
            ]
          }
        ])
        setIsLoading(false)
      }, 1000)
    }
    fetchManagers()
  }, [])

  // Filter data
  const filteredManagers = useMemo(() => {
    return managers.filter((manager) => {
      const matchesSearch =
        manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = departmentFilter === "all" || manager.department === departmentFilter
      const matchesStatus = statusFilter === "all" || manager.status === statusFilter
      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [managers, searchTerm, departmentFilter, statusFilter])

  const ProjectsPreview = ({ projects }: { projects: Manager['projectsHandled'] }) => (
    <div className="space-y-2">
      {projects.slice(0, 2).map((project) => (
        <div key={project.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[project.priority].dot}`}></div>
            <span className="text-sm font-medium text-gray-700 truncate">{project.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 w-8">{project.progress}%</span>
          </div>
        </div>
      ))}
      {projects.length > 2 && (
        <div className="text-xs text-gray-500 text-center">
          +{projects.length - 2} more projects
        </div>
      )}
    </div>
  )

  const departments = ["all", ...Array.from(new Set(managers.map(m => m.department)))]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 p-3 rounded-lg shadow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Managers Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage and track all project managers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
      <button
        type="button"
        className="bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center space-x-2"
        onClick={() => router.push("/dashboard/admin/addmanager")}
      >
        <Plus className="w-4 h-4" />
        <span>Add Manager</span>
      </button>
      <button className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:border-gray-400 hover:text-gray-800 transition-all duration-300 flex items-center space-x-2 shadow-sm">
        <RefreshCw className="w-4 h-4" />
        <span>Refresh</span>
      </button>
    </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text"
                  placeholder="Search managers by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <select 
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg py-2 px-3 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.slice(1).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg py-2 px-3 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
                
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-800">{filteredManagers.length}</span> of {managers.length} managers
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Current Projects</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array(6).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          {Array(7).fill(0).map((_, i) => (
                            <td key={i} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredManagers.map((manager, idx) => (
                      <tr key={manager.id} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                src={manager.avatar}
                                alt={manager.name}
                                className="w-12 h-12 rounded-full shadow-md"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${STATUS_CONFIG[manager.status].dot}`}></div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{manager.name}</div>
                              <div className="text-sm text-gray-600">{manager.id}</div>
                              <div className="text-xs text-gray-500">Joined {manager.joinDate}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{manager.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{manager.phone}</span>
                            </div>
                            <div className="text-xs text-gray-500">{manager.experience} experience</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Building2 className="w-3 h-3" />
                            <span>{manager.department}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${STATUS_CONFIG[manager.status].bg} ${STATUS_CONFIG[manager.status].text}`}>
                            <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[manager.status].dot}`}></div>
                            <span>{manager.status}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center space-x-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{manager.totalProjects}</div>
                                <div className="text-xs text-gray-500">Total</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{manager.activeProjects}</div>
                                <div className="text-xs text-gray-500">Active</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{manager.completedProjects}</div>
                                <div className="text-xs text-gray-500">Completed</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="min-w-0 flex-1">
                            <ProjectsPreview projects={manager.projectsHandled} />
                            {manager.projectsHandled.length > 2 && (
                              <button
                                onClick={() => setExpandedManager(expandedManager === manager.id ? null : manager.id)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
                              >
                                {expandedManager === manager.id ? 'Show Less' : 'View All Projects'}
                              </button>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-1">
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="View Manager">
                              <Eye className="w-4 h-4 text-blue-600 group-hover/btn:text-blue-700" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="Edit Manager">
                              <Edit className="w-4 h-4 text-gray-600 group-hover/btn:text-gray-700" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="Remove Manager">
                              <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Expanded Projects Modal/Section */}
          {expandedManager && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      All Projects - {managers.find(m => m.id === expandedManager)?.name}
                    </h3>
                    <button
                      onClick={() => setExpandedManager(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3">
                    {managers.find(m => m.id === expandedManager)?.projectsHandled.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${PRIORITY_CONFIG[project.priority].dot}`}></div>
                            <div>
                              <div className="font-semibold text-gray-800">{project.title}</div>
                              <div className="text-sm text-gray-600">{project.id}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${PRIORITY_CONFIG[project.priority].bg} ${PRIORITY_CONFIG[project.priority].text}`}>
                              {project.priority}
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-12">{project.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Footer */}
          {!isLoading && (
            <div className="bg-gray-100 rounded-lg p-4 mt-6 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <span className="font-semibold text-gray-800 block text-lg">{managers.length}</span>
                  <span>Total Managers</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-800 block text-lg">{filteredManagers.length}</span>
                  <span>Filtered Results</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-800 block text-lg">{managers.filter(m => m.status === 'Active').length}</span>
                  <span>Active Managers</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-800 block text-lg">{managers.reduce((sum, m) => sum + m.totalProjects, 0)}</span>
                  <span>Total Projects</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-800 block text-lg">{departments.length - 1}</span>
                  <span>Departments</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}