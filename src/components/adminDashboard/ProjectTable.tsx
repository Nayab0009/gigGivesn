"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Edit, Trash2, Eye, MoreHorizontal, Plus, RefreshCw, Paperclip, Users, Calendar, Star, TrendingUp } from 'lucide-react'

// --- Types for Projects Table ---
interface Project {
  id: string
  title: string
  priority: "High" | "Medium" | "Low"
  startDate: string
  dueDate: string
  attachments: number
  users: { name: string; avatar: string; role?: string }[]
  progress?: number
  status?: "Active" | "Completed" | "On Hold"
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

const STATUS_CONFIG = {
  Active: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "On Hold": { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
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

export default function EnhancedProjectsTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchProjects = async () => {
      setTimeout(() => {
        // Enhanced mock data with more realistic information
        const mockUsers = [
          { name: "Sarah Chen", role: "Lead Designer" },
          { name: "Mike Rodriguez", role: "Frontend Dev" },
          { name: "Emma Watson", role: "Product Manager" },
          { name: "Lisa Park", role: "Backend Dev" },
          { name: "David Kim", role: "QA Engineer" },
          { name: "Alex Johnson", role: "DevOps" },
          { name: "Maria Garcia", role: "UI/UX Designer" },
          { name: "John Smith", role: "Full Stack Dev" }
        ];

        setProjects([
          {
            id: "PRJ-001",
            title: "E-commerce Platform Redesign",
            priority: "High",
            startDate: "2024-05-01",
            dueDate: "2024-06-15",
            attachments: 8,
            progress: 75,
            status: "Active",
            users: [
              { ...mockUsers[0], avatar: generateAvatar(mockUsers[0].name, 0) },
              { ...mockUsers[1], avatar: generateAvatar(mockUsers[1].name, 1) },
              { ...mockUsers[2], avatar: generateAvatar(mockUsers[2].name, 2) }
            ]
          },
          {
            id: "PRJ-002",
            title: "Mobile Banking App",
            priority: "High",
            startDate: "2024-04-10",
            dueDate: "2024-07-20",
            attachments: 12,
            progress: 45,
            status: "Active",
            users: [
              { ...mockUsers[3], avatar: generateAvatar(mockUsers[3].name, 3) },
              { ...mockUsers[4], avatar: generateAvatar(mockUsers[4].name, 0) },
              { ...mockUsers[5], avatar: generateAvatar(mockUsers[5].name, 1) },
              { ...mockUsers[6], avatar: generateAvatar(mockUsers[6].name, 2) }
            ]
          },
          {
            id: "PRJ-003",
            title: "API Integration Suite",
            priority: "Medium",
            startDate: "2024-05-12",
            dueDate: "2024-08-10",
            attachments: 5,
            progress: 30,
            status: "Active",
            users: [
              { ...mockUsers[7], avatar: generateAvatar(mockUsers[7].name, 3) },
              { ...mockUsers[1], avatar: generateAvatar(mockUsers[1].name, 0) }
            ]
          },
          {
            id: "PRJ-004",
            title: "Quality Assurance Sprint",
            priority: "High",
            startDate: "2024-06-01",
            dueDate: "2024-06-25",
            attachments: 15,
            progress: 90,
            status: "Active",
            users: [
              { ...mockUsers[4], avatar: generateAvatar(mockUsers[4].name, 1) },
              { ...mockUsers[2], avatar: generateAvatar(mockUsers[2].name, 2) }
            ]
          },
          {
            id: "PRJ-005",
            title: "Cloud Infrastructure Migration",
            priority: "Medium",
            startDate: "2024-05-20",
            dueDate: "2024-09-01",
            attachments: 22,
            progress: 60,
            status: "On Hold",
            users: [
              { ...mockUsers[5], avatar: generateAvatar(mockUsers[5].name, 3) },
              { ...mockUsers[3], avatar: generateAvatar(mockUsers[3].name, 0) },
              { ...mockUsers[0], avatar: generateAvatar(mockUsers[0].name, 1) }
            ]
          },
          {
            id: "PRJ-006",
            title: "Customer Portal v2.0",
            priority: "Low",
            startDate: "2024-03-15",
            dueDate: "2024-05-30",
            attachments: 6,
            progress: 100,
            status: "Completed",
            users: [
              { ...mockUsers[6], avatar: generateAvatar(mockUsers[6].name, 2) },
              { ...mockUsers[7], avatar: generateAvatar(mockUsers[7].name, 3) }
            ]
          },
          {
            id: "PRJ-007",
            title: "Data Analytics Dashboard",
            priority: "Medium",
            startDate: "2024-06-05",
            dueDate: "2024-08-15",
            attachments: 9,
            progress: 25,
            status: "Active",
            users: [
              { ...mockUsers[0], avatar: generateAvatar(mockUsers[0].name, 0) },
              { ...mockUsers[3], avatar: generateAvatar(mockUsers[3].name, 3) }
            ]
          },
          {
            id: "PRJ-008",
            title: "Security Audit Implementation",
            priority: "High",
            startDate: "2024-05-28",
            dueDate: "2024-07-10",
            attachments: 18,
            progress: 55,
            status: "Active",
            users: [
              { ...mockUsers[5], avatar: generateAvatar(mockUsers[5].name, 1) },
              { ...mockUsers[4], avatar: generateAvatar(mockUsers[4].name, 2) },
              { ...mockUsers[1], avatar: generateAvatar(mockUsers[1].name, 3) }
            ]
          }
        ])
        setIsLoading(false)
      }, 1000)
    }
    fetchProjects()
  }, [])

  // Filter data
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [projects, searchTerm, priorityFilter, statusFilter])

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${
          progress >= 80 ? 'bg-green-500' :
          progress >= 50 ? 'bg-blue-500' :
          'bg-orange-500'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-6">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 p-3 rounded-lg shadow-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Project Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage and track all your projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Project</span>
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
                  placeholder="Search projects by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg py-2 px-3 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg py-2 px-3 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
                
                <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-800">{filteredProjects.length}</span> of {projects.length} projects
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Project ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Title & Progress</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Timeline</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Files</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading
                    ? Array(8).fill(0).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          {Array(8).fill(0).map((_, i) => (
                            <td key={i} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredProjects.map((project, idx) => (
                      <tr key={project.id} className="hover:bg-gray-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 text-base">{project.id}</div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                              {project.title}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-gray-800">{project.progress}%</span>
                              </div>
                              <ProgressBar progress={project.progress || 0} />
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold border ${PRIORITY_CONFIG[project.priority].bg} ${PRIORITY_CONFIG[project.priority].text} ${PRIORITY_CONFIG[project.priority].border}`}>
                            <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[project.priority].dot}`}></div>
                            <span>{project.priority}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${STATUS_CONFIG[project.status!].bg} ${STATUS_CONFIG[project.status!].text}`}>
                            <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[project.status!].dot}`}></div>
                            <span>{project.status}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Start: {project.startDate}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {project.dueDate}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                            <Paperclip className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-800">{project.attachments}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                              {project.users.slice(0, 3).map((user, i) => (
                                <div key={user.name + i} className="relative group/avatar">
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-white shadow hover:scale-110 transition-transform duration-200 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                    <div className="font-semibold">{user.name}</div>
                                    <div className="text-gray-300">{user.role}</div>
                                  </div>
                                </div>
                              ))}
                              {project.users.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white shadow flex items-center justify-center text-white font-bold text-xs">
                                  +{project.users.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-1">
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="View Project">
                              <Eye className="w-4 h-4 text-blue-600 group-hover/btn:text-blue-700" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="Edit Project">
                              <Edit className="w-4 h-4 text-gray-600 group-hover/btn:text-gray-700" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 group/btn" title="Delete Project">
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

          {/* Summary Footer */}
          {!isLoading && (
            <div className="bg-gray-100 rounded-lg p-4 mt-6 border border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Projects: <span className="font-semibold text-gray-800">{projects.length}</span></span>
                <span>Filtered Results: <span className="font-semibold text-gray-800">{filteredProjects.length}</span></span>
                <span>Active Projects: <span className="font-semibold text-gray-800">{projects.filter(p => p.status === 'Active').length}</span></span>
                <span>Completed Projects: <span className="font-semibold text-gray-800">{projects.filter(p => p.status === 'Completed').length}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}