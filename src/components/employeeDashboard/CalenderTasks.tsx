"use client"
import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Calendar, Clock, MapPin, User, Bell, Briefcase, Filter, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
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

// Days of the week (Monday to Saturday)
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper to check if two dates are in the same week
function isSameWeek(date1: Date, date2: Date) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0,0,0,0);
  d2.setHours(0,0,0,0);
  d1.setDate(d1.getDate() - ((d1.getDay() + 6) % 7));
  d2.setDate(d2.getDate() - ((d2.getDay() + 6) % 7));
  return d1.getTime() === d2.getTime();
}

// Generate day numbers dynamically (week starting from Monday)
const today = new Date();
const currentDay = today.getDay();
const mondayDate = new Date(today);
const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
mondayDate.setDate(today.getDate() - daysFromMonday);

const dayNumbers: Record<string, string> = {};
days.forEach((day, index) => {
  const date = new Date(mondayDate);
  date.setDate(mondayDate.getDate() + index);
  dayNumbers[day] = date.getDate().toString();
});

// Colors for different priority levels
const priorityColors: Record<string, string> = {
  Critical: "#FF8731",
  High: "#FF4C4C",
  Medium: "#FFBE31",
  Low: "#4C8FFF",
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
  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0)


  // Calculate mondayDate and week range based on weekOffset
  const today = new Date();
  const currentDay = today.getDay();
  const mondayDate = new Date(today);
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  mondayDate.setDate(today.getDate() - daysFromMonday + weekOffset * 7);
  // Calculate week start and end
  const weekStart = new Date(mondayDate);
  const weekEnd = new Date(mondayDate);
  weekEnd.setDate(weekStart.getDate() + 5); // Saturday
  // Format week range string
  function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const weekRange = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

  // Dynamically generate day numbers for the displayed week
  const dayNumbers: Record<string, string> = {};
  days.forEach((day, index) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + index);
    dayNumbers[day] = date.getDate().toString();
  });

  // Get unique projects
  const projects = Array.from(new Set(tasks.map((task) => task.projectName).filter(Boolean)));

  const projectId = 1;

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

  // Update dayNumbers for the current week
  // Process tasks from API and organize by day
  const schedule: Record<string, any[]> = {};
  days.forEach(day => (schedule[day] = []));
  filteredTasks.forEach(task => {
    if (task.start) {
      const taskDateObj = new Date(task.start);
      // Only include if in current week
      if (isSameWeek(taskDateObj, mondayDate)) {
        const dayName = getDayName(task.start);
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
      {/* Calendar heading and subheading at the top */}
      <div className="pb-[16px] pt-6 px-2">
        <h1 className="text-2xl font-bold text-white">My Calendar</h1>
        <p className="text-white/60 ">Manage your schedule and events-259</p>
      </div>
      {/* Week range and navigation header below heading */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div 
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '0px',
            verticalAlign: 'middle',
            borderRadius: '6px',
            // padding: '2px 12px',
            color: '#FFFFFF99',
            display: 'inline-block',
            
          }}
        >
          {weekRange}
        </div>
        <div className="flex gap-2">
          <button
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        className="w-full text-white overflow-auto scrollbar-hide mx-auto"
        style={{
          height: 'auto',
          borderRadius: '12px',
          borderWidth: '1px',
          opacity: 1,
          padding: '4px',
          background: '#0000004D',
          backgroundBlendMode: 'luminosity',
          border: '1px solid #FFFFFF4D',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex flex-row gap-2 w-full">
        {days.map((day, idx) => {
          const tasks = schedule[day];
          const isLast = idx === days.length - 1;
          return (
            <div
              key={day}
              className={`flex flex-col gap-2 border-b border-white/30 px-2 flex-1 min-w-0 ${!isLast ? 'border-r border-white/20' : ''}`}
            >
              {/* Day header */}
                <div className="p-2 text-white text-center border-b border-white/30">
                  <div className="text-sm">
                    {dayNames[day as keyof typeof dayNames]} {dayNumbers[day]}
                  </div>
                </div>

                {/* Tasks */}
                {tasks.map((task, idx) => {
                  const taskCodeColor =
                    task.taskCode?.startsWith("FAZ") || task.taskCode?.startsWith("SO")
                      ? "text-[#0CA9F6]"
                      : "text-[#0CA9F6]";

                  return (
                    <div
                      key={`${day}-${task.id || idx}`}
                      className="flex flex-col justify-between bg-black/30 text-[#0CA9F6] relative overflow-hidden shadow-lg h-[240px] p-4 rounded-[15px] border border-white/10 gap-y-[12px]"
                      style={{
                        opacity: 1,
                        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
                      }}
                    >
                      <div className="flex justify-between items-center mb-1 gap-[32px]">
                        <div className="flex flex-col items-start gap-0">
                          <span
                            className={`font-semibold text-[#0CA9F6] ${taskCodeColor}`}

                            style={{
                            fontFamily: "Inter",
                            fontWeight: 600,
                            fontSize: "10px",
                            lineHeight: "100%",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                          }}
                          >
                            {task.taskCode}
                          </span>
                          <span className="mt-1 px-2 py-0.5 text-[10px] rounded-full bg-[#0CA9F6] text-white font-semibold"
                          style={{
                            fontFamily: "Inter",
                            fontWeight: 600,
                            fontSize: "8px",
                            lineHeight: "100%",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                          }}
                          >
                            Done
                          </span>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{
                            backgroundColor: priorityColors[
                              (task.priority || "Medium").trim().charAt(0).toUpperCase() + (task.priority || "Medium").trim().slice(1).toLowerCase()
                            ] || "#FFBE31",
                            fontFamily: "Inter",
                            fontWeight: 500,
                            fontSize: "8px",
                            lineHeight: "100%",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2 gap-[12px]">
                        <div
                          className="text-white font-semibold overflow-hidden"
                          style={{
                            fontFamily: "Inter",
                            fontWeight: 600,
                            fontSize: "14px",
                            lineHeight: "100%",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",

                          }}
                          title={task.title} // Show full title on hover
                        >
                          {task.title}
                        </div>
                        <div className="text-xs text-[#FFFFFF] mt-1 overflow-hidden"
                        style={{
                            fontFamily: "Inter",
                            fontWeight: 400,
                            fontSize: "12px",
                            lineHeight: "140%",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}
                          title={task.description} // Show full description on hover
                        >
                          {task.description}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-6">
                        <div className="flex items-center gap-2">
                          {/* Avatar */}
                          {task.taskFor?.avatar ? (
                            <img
                              src={task.taskFor.avatar}
                              className="w-7 h-7 rounded-full border-2 border-white object-cover"
                              alt={task.taskFor.name || "Assignee"}
                              title={task.taskFor.name || "Assignee"}
                            />
                          ) : (
                            <div
                              className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs border-2 border-white"
                              title={task.taskFor?.name || "Assignee"}
                            >
                              {task.taskFor?.name?.charAt(0) || "A"}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="flex items-center text-xs font-semibold text-white/80">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                              <path
                                d="M12 6v6l4 2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {task.duration}
                          </span>
                          {/* Eye Icon */}
                          <span
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/30 border border-white/10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // handleTaskClick(task.id);
                            }}
                          >
                            <img
                              src="/images/Eye.svg"
                              alt="View Icon"
                              className="w-4 h-4 text-white/80"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* No tasks fallback */}
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
  );
}

