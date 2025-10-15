// src/components/TimeTable.jsx


import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getManagerTasksByProjectId, getEmployeeTasksByProjectId, getTasksByProjectId } from "@/lib/TaskService";
import TaskDetailsPopup from "../managerDashboard/TaskDetails";
import { useEffect, useState } from "react";
import { interFont } from "@/app/layout";

// Helper to get day name from date string
function getDayName(dateString: string) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
}

// Helper to truncate text with ellipsis if it exceeds maxLength
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Short day names for the header
const dayNames: Record<string, string> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

// Colors for different priority levels
const priorityColors: Record<string, string> = {
  Critical: "#FF8731",
  High: "#FF4C4C",
  Medium: "#FFBE31",
  Low: "#4C8FFF",
};

interface TimeTableProps {
  projectId?: string | number;
  projectName?: string;
}

const TimeTable = ({ projectId, projectName }: TimeTableProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        let data;
        if (projectId) {
          if (user?.role === "employee") {
            data = await getEmployeeTasksByProjectId(String(projectId));
          } else if (user?.role === "admin") {
            data = await getTasksByProjectId(String(projectId));
          } else {
            data = await getManagerTasksByProjectId(String(projectId));
          }
        }
        setTasks(Array.isArray(data) ? data : []);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId, user?.role]);

  // Days of the week (Monday to Saturday)
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Helper to check if two dates are in the same week
  function isSameWeek(date1: Date, date2: Date) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    d1.setDate(d1.getDate() - ((d1.getDay() + 6) % 7));
    d2.setDate(d2.getDate() - ((d2.getDay() + 6) % 7));
    return d1.getTime() === d2.getTime();
  }

  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0);
  // Generate day numbers dynamically (week starting from Monday)
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


  const dayNumbers: Record<string, string> = {};
  days.forEach((day, index) => {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + index);
    dayNumbers[day] = date.getDate().toString();
  });

  // Map tasks to days of the week
  const schedule: Record<string, any[]> = {};
  days.forEach((day) => (schedule[day] = []));

  // Process tasks from API and organize by day
  tasks.forEach((task) => {
    if (task.taskDate) {
      const taskDateObj = new Date(task.taskDate);
      // Only include if in current week
      if (isSameWeek(taskDateObj, mondayDate)) {
        const dayName = getDayName(task.taskDate);
        if (days.includes(dayName)) {
          const taskCode = task.ticketNumber || `TASK-${task.id}`;
          const formattedTask = {
            id: task.id,
            taskCode,
            title: task.title || "Untitled Task",
            description: task.description || "No description provided",
            priority: task.priority || "Medium",
            attendees: [
              task.taskFor?.name || "Assignee",
              task.createdBy?.name || "Creator",
            ],
            duration: (() => {
              // Prefer taskOf.startDate/endDate if available
              if (task.taskOf?.startDate && task.taskOf?.endDate) {
                const start = new Date(task.taskOf.startDate);
                const end = new Date(task.taskOf.endDate);
                const diffMs = end.getTime() - start.getTime();
                if (diffMs > 0) {
                  const h = Math.floor(diffMs / 3600000);
                  const m = Math.floor((diffMs % 3600000) / 60000);
                  return `${h > 0 ? h + "h " : ""}${m}m`;
                }
              }
              // Fallback: use createdAt and updatedAt if available
              if (task.createdAt && task.updatedAt) {
                const start = new Date(task.createdAt);
                const end = new Date(task.updatedAt);
                const diffMs = end.getTime() - start.getTime();
                if (diffMs > 0) {
                  const h = Math.floor(diffMs / 3600000);
                  const m = Math.floor((diffMs % 3600000) / 60000);
                  return `${h > 0 ? h + "h " : ""}${m}m`;
                }
              }
              return "—";
            })(),
            taskDate: task.taskDate,
            taskFor: task.taskFor,
            createdBy: task.createdBy,
            // Include the sprint data for the popup
            sprint: task.sprint || task.taskOf,
            ticketNumber: task.ticketNumber,
            status: task.status,
            // Include the original task data to ensure we have all fields
            ...task,
          };
          schedule[dayName].push(formattedTask);
        }
      }
    }
  });

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedTask(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2`">
        
        <div className="text-text-main text-sm font-medium">{weekRange}</div>
        <div className="flex gap-2">
          <button
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5 text-text-main" />
          </button>
          <button
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5 text-text-main" />
          </button>
        </div>
      </div>
      <div
        className={`w-full p-4 rounded-3xl border [border:var(--border-style)] [box-shadow:var(--shadow-combined)] 
 [background:var(--container-bg)] overflow-x-auto`}
        style={{
          scrollbarWidth: "none",
          opacity: 1,
          backdropFilter: "blur(101.67px)",
          backgroundBlendMode: "luminosity",
        }}
      >
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
                <div className="p-2 text-text-main text-center border-b border-white/30">
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
                      className="flex flex-col justify-between border [border:var(--border-style)] [box-shadow:var(--shadow-combined)] 
 [background:var(--container-bg)] text-[#0CA9F6] relative overflow-hidden shadow-lg h-[240px] p-4 rounded-[15px] border border-white/30 gap-y-[12px]"
                      style={{
                        opacity: 1,
              
                      }}
                      onClick={() => handleTaskClick(task)}
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
                      <div className="mt-2 gap-3 flex flex-col">
                        <div
                          className="text-text-main font-semibold overflow-hidden"
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
                        <div className="text-xs text-text-main mt-1 overflow-hidden"
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
                          <span className="flex items-center text-xs font-semibold text-text-main">
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
                              handleTaskClick(task);
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
        </div >
      </div >

      {/* Task popup */}
      {
        isPopupOpen && selectedTask && (
          <TaskDetailsPopup task={selectedTask} onClose={closePopup} />
        )
      }
    </>
  );
};

export default TimeTable;
