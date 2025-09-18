"use client"
import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Calendar, Clock, MapPin, User, Bell, Briefcase, Filter, Search, Plus } from "lucide-react"
import { fetchEmployeeAllTasks } from "@/lib/TeamService"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"

// Define Task type for backend response
interface BackendTask {
  id: number
  title: string
  startDate?: string
  endDate?: string
  createdAt?: string
  description?: string
  priority?: string
  category?: string
  attendees?: string[]
  backgroundColor?: string
  borderColor?: string
  taskOf?: {
    name: string
  }
  [key: string]: any
}

// Define TaskEvent type for FullCalendar
interface TaskEvent {
  id: string
  title: string
  start?: string
  end?: string
  description?: string
  priority?: string
  category?: string
  attendees?: string[]
  backgroundColor?: string
  borderColor?: string
  projectName?: string
  extendedProps?: any
}

export default function CalendarPage() {
  const { user, isAuthenticated } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState<TaskEvent[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Get unique projects
  const projects = Array.from(new Set(tasks.map((task) => task.projectName).filter(Boolean)))

  const projectId = 1

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated || !user?.id) {
        setError("User not authenticated")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const fetchedTasks = await fetchEmployeeAllTasks()

        // Map backend tasks to FullCalendar event format
        const calendarTasks: TaskEvent[] = fetchedTasks.map((task: BackendTask) => ({
          id: String(task.id),
          title: task.title,
          start: task.taskDate || task.startDate || task.createdAt,
          end: task.taskDate || task.endDate || undefined,
          description: task.description,
          priority: task.priority || "medium",
          category: task.category || "work",
          attendees: task.attendees || [],
          projectName: task.taskOf?.name || "No Project",
          backgroundColor: getProjectColor(task.taskOf?.name || "No Project"),
          borderColor: getProjectBorderColor(task.taskOf?.name || "No Project"),
          extendedProps: {
            ...task,
            projectName: task.taskOf?.name || "No Project",
          },
        }))

        setTasks(calendarTasks)
        setFilteredTasks(calendarTasks)
      } catch (err) {
        setError("Failed to load tasks")
        setTasks([])
        setFilteredTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [isAuthenticated, user, projectId])

  // Filter tasks based on project and search
  useEffect(() => {
    let filtered = tasks

    if (selectedProject !== "all") {
      filtered = filtered.filter((task) => task.projectName === selectedProject)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.projectName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, selectedProject, searchTerm])

  const getProjectColor = (projectName: string) => {
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
    const index = projectName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  const getProjectBorderColor = (projectName: string) => {
    const colors = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2", "#65a30d"]
    const index = projectName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  const handleEventClick = (info: { event: any }) => {
    setSelectedEvent(info.event)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meeting":
        return <User className="w-4 h-4" />
      case "client":
        return <Bell className="w-4 h-4" />
      case "development":
        return <Calendar className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  // Custom event content renderer
  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="event-content flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
        
  
        </div>
        <div className="event-title font-bold text-sm text-gray-900 whitespace-normal break-words">
          {eventInfo.event.title}
        </div>
        <div className="event-project text-xs text-gray-700 whitespace-normal break-words">
          {eventInfo.event.extendedProps.projectName}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Enhanced Header */}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold  bg-clip-text text-white">
                  My  Calendar
                </h1>
                <p className="text-sm text-white mt-1">Manage your tasks across all projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg">
                <Briefcase className="w-5 h-5" />
                <span className="font-semibold">{tasks.length} Tasks</span>
              </div>
            
            </div>
          </div>
        </div>
      </header>

  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks, projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Project Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Legend */}
            <div className="flex flex-wrap gap-2">
              {projects.slice(0, 4).map((project) => (
                <div key={project} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getProjectColor(project) }} />
                  <span className="text-sm font-medium text-gray-700">{project}</span>
                </div>
              ))}
              {projects.length > 4 && (
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">+{projects.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Calendar Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center space-x-3 text-blue-600 font-semibold text-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span>Loading your tasks...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-600 font-semibold text-xl">{error}</div>
            ) : (
              <div className="calendar-wrapper">
                <style jsx>{`
                  .calendar-wrapper .fc {
                    font-family: 'Inter', system-ui, sans-serif;
                  }
                  .calendar-wrapper .fc-toolbar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                  }
                  .calendar-wrapper .fc-toolbar-title {
                    color: white !important;
                    font-size: 2rem !important;
                    font-weight: 800 !important;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .calendar-wrapper .fc-button {
                    background: rgba(255,255,255,0.2) !important;
                    border: 1px solid rgba(255,255,255,0.3) !important;
                    color: white !important;
                    border-radius: 12px !important;
                    padding: 10px 20px !important;
                    font-weight: 600 !important;
                    transition: all 0.3s ease !important;
                    backdrop-filter: blur(10px) !important;
                  }
                  .calendar-wrapper .fc-button:hover {
                    background: rgba(255,255,255,0.3) !important;
                    border-color: rgba(255,255,255,0.4) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
                  }
                  .calendar-wrapper .fc-button-active {
                    background: rgba(255,255,255,0.4) !important;
                    border-color: rgba(255,255,255,0.5) !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                  }
                  .calendar-wrapper .fc-daygrid-day {
                    border: 1px solid #f1f5f9 !important;
                    background: white !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                  }
                  .calendar-wrapper .fc-daygrid-day:hover {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    transform: scale(1.02) !important;
                    z-index: 10 !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
                    border-color: #cbd5e1 !important;
                  }
                  .calendar-wrapper .fc-day-today {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
                    border: 2px solid #3b82f6 !important;
                    position: relative !important;
                  }
                  .calendar-wrapper .fc-event {
                    border: none !important;
                    border-radius: 10px !important;
                    padding: 10px 12px !important;
                    margin: 3px 5px !important;
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.15) !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                    overflow: visible !important;
                    border-left: 4px solid rgba(255,255,255,0.4) !important;
                    min-height: 50px !important;
                  }
                  .calendar-wrapper .fc-event:hover {
                    transform: translateY(-3px) scale(1.05) !important;
                    box-shadow: 0 12px 35px rgba(0,0,0,0.25) !important;
                    z-index: 100 !important;
                  }
                  .calendar-wrapper .fc-daygrid-day-frame {
                    min-height: 160px !important;
                    padding: 10px !important;
                  }
                  
                  /* Custom event content styles */
                  .event-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    justify-content: center;
                    line-height: 1.2;
                  }
                  
                  .event-title {
                    font-weight: 700 !important;
                    font-size: 0.95rem !important;
                    color: #1e293b !important;
                    margin-bottom: 2px !important;
                    white-space: normal !important;
                    overflow-wrap: break-word !important;
                  }
                  .event-project {
                    font-weight: 500 !important;
                    font-size: 0.8rem !important;
                    color: #334155 !important;
                    opacity: 0.9;
                    white-space: normal !important;
                    overflow-wrap: break-word !important;
                  }
                `}</style>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek,dayGridDay",
                  }}
                  events={filteredTasks}
                  eventContent={renderEventContent}
                  eventClick={handleEventClick}
                  height="auto"
                  contentHeight={750}
                  eventDisplay="block"
                  dayMaxEvents={3}
                  moreLinkClick="popover"
                  eventClassNames="cursor-pointer"
                  fixedWeekCount={false}
                  showNonCurrentDates={false}
                  dayHeaderFormat={{ weekday: "short" }}
                  displayEventTime={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-xl border border-red-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-wide">High Priority</p>
                <p className="text-3xl font-bold text-red-700 mt-2">
                  {filteredTasks.filter((t) => t.priority === "high").length}
                </p>
                <p className="text-xs text-red-500 mt-1">Critical tasks</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">This Week</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">
                  {
                    filteredTasks.filter((t) => {
                      const taskDate = new Date(t.start || "")
                      const now = new Date()
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return taskDate >= now && taskDate <= weekFromNow
                    }).length
                  }
                </p>
                <p className="text-xs text-blue-500 mt-1">Upcoming tasks</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl border border-green-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Projects</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{projects.length}</p>
                <p className="text-xs text-green-500 mt-1">Active projects</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-xl border border-purple-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Meetings</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">
                  {filteredTasks.filter((t) => t.category === "meeting" || t.category === "client").length}
                </p>
                <p className="text-xs text-purple-500 mt-1">Scheduled meetings</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Event Detail Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedEvent.backgroundColor }} />
                  <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Badge */}
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
                    style={{ backgroundColor: selectedEvent.backgroundColor }}
                  >
                    {selectedEvent.extendedProps.projectName}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedEvent.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedEvent.extendedProps.description || "No description available"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Due Date</p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.extendedProps.taskDate ? new Date(String(selectedEvent.extendedProps.taskDate || '')).toLocaleString() : (selectedEvent.start ? new Date(String(selectedEvent.start || '')).toLocaleString() : "Not set")}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.extendedProps.location && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{selectedEvent.extendedProps.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getCategoryIcon(selectedEvent.extendedProps.category)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">Category</p>
                      <p className="text-sm text-gray-600 capitalize">{selectedEvent.extendedProps.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Priority</p>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedEvent.extendedProps.priority)}`}
                      >
                        {selectedEvent.extendedProps.priority} priority
                      </span>
                    </div>
                  </div>
                </div>

                {selectedEvent.extendedProps.attendees && selectedEvent.extendedProps.attendees.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Attendees</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.extendedProps.attendees.map((attendee: string, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
