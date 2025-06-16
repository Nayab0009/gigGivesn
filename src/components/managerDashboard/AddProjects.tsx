"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, Edit, Trash2, Eye, RefreshCw, ClipboardCheck, AlertCircle, ChevronDown, UserCheck } from "lucide-react"
import { AssignTeamModal } from "../adminDashboard/AssignProjectTeam"
import { AssignTaskModal } from "../adminDashboard/AssignProjectTicket"
import type { Task, Team, Project } from "@/types"

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
  // Dynamic teams state (mock data for now, replace with API later)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assignTeamProjectId, setAssignTeamProjectId] = useState<string | null>(null)
  const [assignTaskProjectId, setAssignTaskProjectId] = useState<string | null>(null)
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

  // --- MOCK TEAM DATA, stored in state ---
  useEffect(() => {
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
  }, [])

  // --- MOCK PROJECTS DATA, with some teams assigned ---
  useEffect(() => {
    setTimeout(() => {
      setProjects([
        {
          id: "PRJ-001",
          title: "E-commerce Platform Redesign",
          description:
            "Complete redesign of the e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness.",
          startDate: "2024-05-01",
          endDate: "2024-08-15",
          status: "active",
          priority: "high",
          budget: 150000,
          completion: 65,
          team: undefined, // or teams[0] if you want to assign a team initially
          tasks: [],
        },
        {
          id: "PRJ-002",
          title: "Mobile Banking Application",
          description:
            "Cross-platform mobile banking app with advanced security features and intuitive user interface.",
          startDate: "2024-04-10",
          endDate: "2024-09-30",
          status: "planning",
          priority: "critical",
          budget: 300000,
          completion: 25,
          team: undefined,
          tasks: [],
        },
        {
          id: "PRJ-003",
          title: "API Integration Suite",
          description:
            "Comprehensive API integration platform for connecting with third-party services and internal systems.",
          startDate: "2024-05-12",
          endDate: "2024-07-20",
          status: "active",
          priority: "medium",
          budget: 75000,
          completion: 40,
          team: undefined,
          tasks: [],
        },
        {
          id: "PRJ-004",
          title: "Customer Support Portal",
          description: "Self-service customer support portal with ticketing system and knowledge base.",
          startDate: "2024-06-01",
          endDate: "2024-08-30",
          status: "on-hold",
          priority: "low",
          budget: 50000,
          completion: 10,
          team: undefined,
          tasks: [],
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  // --- PROJECT TABLE LOGIC as before ---
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [projects, searchTerm, statusFilter, priorityFilter])

  // --- Assign Team Logic ---
  const assignTeam = (projectId: string, team: Team) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, team } : p)))
    setAssignTeamProjectId(null)
  }

  // --- Assign Task Logic ---
  const addTaskToProject = (projectId: string | null) => {
    if (!projectId || !newTask.title.trim() || newTask.assignedTo.length === 0) return
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
    }
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p)))
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
    ? projects.find((p) => p.id === assignTeamProjectId)
    : assignTaskProjectId
      ? projects.find((p) => p.id === assignTaskProjectId)
      : null

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Project Dashboard</h1>
          <p className="text-slate-600 text-lg">Manage and track your project progress</p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by name, ID, or description..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-sm focus:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-slate-900 min-w-[140px] shadow-sm focus:shadow-md"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-300 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-slate-900 min-w-[140px] shadow-sm focus:shadow-md"
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden backdrop-blur-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-600 text-lg">Loading projects...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
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
                        className={`hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/30 transition-all duration-300 ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}
                      >
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-slate-900 leading-tight">{project.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                {project.id}
                              </span>
                              <span className="text-slate-500 text-sm">${project.budget.toLocaleString()} budget</span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-md">{project.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusColor(project.status)}`}
                          >
                            {project.status.replace("-", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getPriorityColor(project.priority)}`}
                          >
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          {project.team ? (
                            <div className="space-y-3">
                              <div>
                                <p className="font-semibold text-slate-900">{project.team.name}</p>
                                <p className="text-sm text-slate-500">{project.team.department}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {project.team.members.slice(0, 4).map((member, idx) => (
                                    <div key={member.id} className="relative">
                                      <img
                                        src={member.avatar || "/placeholder.svg"}
                                        alt={member.name}
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                        style={{ zIndex: 10 - idx }}
                                        title={`${member.name} - ${member.role}`}
                                      />
                                      <div className="absolute -bottom-0.5 -right-0.5" style={{ zIndex: 15 - idx }}>
                                        {getUserStatusIcon(member.status)}
                                      </div>
                                    </div>
                                  ))}
                                  {project.team.members.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 shadow-sm">
                                      +{project.team.members.length - 4}
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm text-slate-500">
                                  {project.team.members.length} member{project.team.members.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <button
                                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                                onClick={() => setAssignTeamProjectId(project.id)}
                              >
                                <UserCheck className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                Change Team
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-center py-4">
                                <p className="text-slate-500 text-sm mb-3">No team assigned</p>
                                <button
                                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                                  onClick={() => setAssignTeamProjectId(project.id)}
                                >
                                  <UserCheck className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                                  Assign Team
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-900">{project.completion}% Complete</span>
                              <span className="text-xs text-slate-500">
                                {project.tasks.length} task{project.tasks.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                                style={{ width: `${project.completion}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-3">
                            <button
                              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                              onClick={() => setAssignTaskProjectId(project.id)}
                            >
                              <ClipboardCheck className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                              Assign Task
                            </button>
                            <div className="flex items-center gap-2">
                              <button className="group inline-flex items-center justify-center w-10 h-10 text-sky-600 hover:text-white bg-sky-50 hover:bg-gradient-to-r hover:from-sky-500 hover:to-sky-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                                <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                              </button>
                              <button className="group inline-flex items-center justify-center w-10 h-10 text-amber-600 hover:text-white bg-amber-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                                <Edit className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                              </button>
                              <button className="group inline-flex items-center justify-center w-10 h-10 text-rose-600 hover:text-white bg-rose-50 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg transform hover:scale-110 hover:-translate-y-1">
                                <Trash2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
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
          project={currentProject}
          teams={teams}
          getUserStatusIcon={getUserStatusIcon}
        />
        <AssignTaskModal
          open={!!assignTaskProjectId}
          onClose={() => setAssignTaskProjectId(null)}
          onAdd={() => addTaskToProject(assignTaskProjectId)}
          task={newTask}
          setTask={setNewTask}
          teamMembers={currentProject?.team?.members || teams.flatMap((team) => team.members)}
          toggleAssignment={toggleTaskAssignment}
          getUserStatusIcon={getUserStatusIcon}
        />
      </div>
    </div>
  )
}
