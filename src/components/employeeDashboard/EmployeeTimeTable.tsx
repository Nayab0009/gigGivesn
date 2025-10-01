// src/components/TimeTable.jsx

import { useEffect, useState } from "react";
import { getTasksByEmployeeId,getTaskById } from "@/lib/TaskService";
import { MoreHorizontal } from "lucide-react";
import TaskDetailsPopup from "../managerDashboard/TaskDetails";

import React from "react"



interface TimeTableProps {
  employeeId?: number
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
  Critical: "#FF8731",
  High: "#BD4242",
  Medium: "#FFBE31",
  Low: "#4C8FFF",
};
const TimeTable = ({ employeeId }: TimeTableProps) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    useEffect(() => {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          // console.log("Fetching manager tasks...");
          const data = await getTasksByEmployeeId(employeeId?.toString() || "");
          // console.log("Manager tasks response:", data);
          setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
          // console.error("Error fetching manager tasks:", error);
          setTasks([]);
        } finally {
          setLoading(false);
        }
      };
      fetchTasks();
    }, []);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Get the current date to generate day numbers
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayDate = new Date(today);
    // Adjust to get Monday's date
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    mondayDate.setDate(today.getDate() - daysFromMonday);

    // Generate day numbers for the week starting from Monday
    const dayNumbers: Record<string, string> = {};
    days.forEach((day, index) => {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + index);
      dayNumbers[day] = date.getDate().toString();
    });

    const schedule: Record<string, any[]> = {};
    days.forEach(day => (schedule[day] = []));
    // Process tasks from API and organize by day
    tasks.forEach(task => {
      if (task.taskDate) {
        const taskDateObj = new Date(task.taskDate);
        // Only include if in current week
        if (isSameWeek(taskDateObj, mondayDate)) {
          const dayName = getDayName(task.taskDate);
          // Only add if it's in our display days
          if (days.includes(dayName)) {
            // Extract ticket code if available (e.g. "FAZ-002" or "SO-003")
            const taskCode = task.ticketNumber || `TASK-${task.id}`;
            // Create a standardized task object
            const formattedTask = {
              id: task.id,
              taskCode: taskCode,
              title: task.title || "Untitled Task",
              description: task.description || "No description provided",
              priority: task.priority || "Medium",
              attendees: [
                task.taskFor?.name || "Assignee", 
                task.createdBy?.name || "Creator"
              ],
              duration: "0h 52m", // Default duration
              taskDate: task.taskDate,
              taskFor: task.taskFor,
              createdBy: task.createdBy
            };
            schedule[dayName].push(formattedTask);
          } else {
            // For weekend or other days not in our display list
            console.log(`Task on day not displayed (${dayName}):`, task.title);
          }
        }
      }
    });
    
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

    const handleTaskClick = async (taskId: string) => {
    try {
      const taskDetails = await getTaskById(taskId);
      setSelectedTask(taskDetails);
      setIsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedTask(null);
  };

    return (
    <>
      <div
        className="w-full p-4 rounded-3xl overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          opacity: 1,
          borderRadius: "12px",
          background: "#0000004D",
          backdropFilter: "blur(101.67px)",
          backgroundBlendMode: "luminosity",
        }}
      >
        <div className="flex flex-row gap-2 w-max">
          {days.map((day, idx) => {
            const tasks = schedule[day];
            const isLast = idx === days.length - 1;
            return (
              <div
                key={day}
                className={`flex flex-col gap-2 border-b border-white/30 px-2 w-[200px] min-w-[200px] ${!isLast ? 'border-r border-white/20' : ''}`}
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
                          <span className="mt-1 px-1 py-0.5 text-[10px] rounded-full bg-[#0CA9F6] text-white font-semibold"
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
                          className="text-xs px-1 py-0.5 rounded-full text-white font-semibold"
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
                               handleTaskClick(task.id);
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

      {/* Task popup */}
      {isPopupOpen && selectedTask && (
        <TaskDetailsPopup task={selectedTask} onClose={closePopup} />
      )}
    </>
  );
};
export default TimeTable;
