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

function getDayName(dateString: string) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = new Date(dateString);
  return days[date.getDay()];
}

// Short day names for the header
const dayNames: Record<string, string> = {
  "Monday": "MON",
  "Tuesday": "TUE",
  "Wednesday": "WED",
  "Thursday": "THU",
  "Friday": "FRI",
  "Saturday": "SAT",
  "Sunday": "SUN"
};

// Day numbers for demo - would be dynamic in real app
const dayNumbers: Record<string, string> = {
  "Monday": "19",
  "Tuesday": "20",
  "Wednesday": "21",
  "Thursday": "22",
  "Friday": "23",
  "Saturday": "24",
  "Sunday": "25"
};

// Colors for different priority levels
const priorityColors: Record<string, string> = {
  "Critical": "bg-orange-500",
  "High": "bg-red-500",
  "Medium": "bg-amber-500",
  "Low": "bg-blue-500",
};

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



  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const schedule: Record<string, any[]> = {};
  days.forEach(day => (schedule[day] = []));

  // Process tasks from API and organize by day
  filteredTasks.forEach(task => {
    if (task.start) {
      const dayName = getDayName(task.start);

      // Only add if it's in our display days
      if (days.includes(dayName)) {
        // Extract ticket code if available (e.g. "FAZ-002" or "SO-003")
        const taskCode = task.extendedProps?.ticketNumber || `TASK-${task.id}`;

        // Create a standardized task object
        const formattedTask = {
          id: task.id,
          taskCode: taskCode,
          title: task.title || "Untitled Task",
          description: task.description || "No description provided",
          priority: task.priority || "Medium",
          attendees: task.attendees || [],
          duration: "0h 52m", // Default duration
          taskDate: task.start,
          taskFor: task.extendedProps?.taskFor,
          createdBy: task.extendedProps?.createdBy
        };

        schedule[dayName].push(formattedTask);
      } else {
        // For weekend or other days not in our display list
        console.log(`Task on day not displayed (${dayName}):`, task.title);
      }
    }
  });

  // Helper to get consistent project colors
  function getProjectColor(projectName: string) {
    const colors = [
      "#f87171", // Red
      "#34d399", // Green
      "#60a5fa", // Blue
      "#fbbf24", // Yellow
      "#a78bfa", // Purple
      "#f472b6", // Pink
      "#38bdf8", // Sky
      "#fb7185", // Rose
    ]
    const index = Math.abs(hashCode(projectName)) % colors.length
    return colors[index]
  }

  function getProjectBorderColor(projectName: string) {
    const colors = [
      "#b91c1c", // Dark Red
      "#047857", // Dark Green
      "#1e40af", // Dark Blue
      "#b45309", // Dark Yellow
      "#7c3aed", // Dark Purple
      "#be185d", // Dark Pink
      "#0c4a6e", // Dark Sky
      "#be123c", // Dark Rose
    ]
    const index = Math.abs(hashCode(projectName)) % colors.length
    return colors[index]
  }

  // Simple hash function for consistent color assignment
  function hashCode(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return hash
  }

  if (isLoading) {
    return <div className="text-white items-center justify-center">Loading tasks...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (tasks.length === 0) {
    return <div className="text-white">No tasks found.</div>
  }



  return (
    <div className="min-h-screen pb-12 text-white rounded-2xl px-6 space-y-4">
      <h1 className="text-2xl font-bold">My Calendar</h1>
      <p className="text-white/60">Manage your schedule and events-259</p>

      <div className="w-full overflow-x-auto bg-black/30 p-4 rounded-3xl h-full"
        style={
          {
            scrollbarWidth: 'none',
          }
      }
      >
        <div className="flex flex-row gap-2 w-full">
          {/* Days headers and task columns */}
          {days.map((day) => {
            const tasks = schedule[day];
            return (
              <div key={day} className="flex flex-col gap-2 flex-1">
                <div className="bg-black/30 p-2 text-white text-center rounded-md">
                  <div className="text-sm">{dayNames[day as keyof typeof dayNames]} {dayNumbers[day]}</div>
                </div>

                {tasks.map((task, idx) => {
                  // Determine priority color class
                  const priorityColorMap: Record<string, string> = {
                    "High": "bg-red-500",
                    "Medium": "bg-amber-500",
                    "Low": "bg-blue-500",
                    "Critical": "bg-orange-500"
                  };

                  // Determine task code color
                  const taskCodeColor =
                    task.taskCode?.startsWith("FAZ") ? "text-orange-500" :
                    task.taskCode?.startsWith("SO") ? "text-blue-500" : "text-gray-300";

                  return (
                    <div
                      key={`${day}-${task.id || idx}`}
                      className="flex flex-col justify-between bg-black/30 text-white relative overflow-hidden shadow-lg w-full min-h-[180px] p-4 rounded-[15px] border border-white/10 gap-y-8"
                      style={{ opacity: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex flex-col items-start gap-0">
                          <span className={`text-xs font-semibold ${taskCodeColor}`}>{task.taskCode}</span>
                          <span className="mt-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-700/80 text-white font-semibold">Done</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-600/90 text-white font-semibold">{task.priority}</span>
                      </div>

                      <div className="mt-2">
                        <div className="text-base font-semibold leading-tight">{task.title}</div>
                        <div className="text-xs text-white/80 mt-1">{task.description}</div>
                      </div>

                      <div className="flex flex-col gap-2 mt-6">
                        <div className="flex items-center">
                          {task.taskFor?.avatar ? (
                            <img
                              src={task.taskFor.avatar}
                              className="w-7 h-7 rounded-full border-2 border-white object-cover"
                              alt={task.taskFor.name || 'Assignee'}
                              title={task.taskFor.name || 'Assignee'}
                            />
                          ) : (
                            <div
                              className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs border-2 border-white"
                              title={task.taskFor?.name || 'Assignee'}
                            >
                              {task.taskFor?.name?.charAt(0) || 'A'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2 justify-between">
                          <span className="flex items-center text-xs font-semibold text-white/80">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {task.duration}
                          </span>

                          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-black/30 border border-white/10 cursor-pointer">
                            <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && (
                  <div className="h-32 rounded-2xl border border-white/5 flex items-center justify-center text-white/30 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
