// src/components/TimeTable.tsx

import { useEffect, useState } from "react";
import { getManagerTasks, getTaskById } from "@/lib/TaskService";
import TaskDetailsPopup from "./TaskDetails";

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
  Critical: "bg-[#FF8731]",
  High: "bg-[#FF4C4C]",
  Medium: "bg-[#FFBE31]",
  Low: "bg-[#4C8FFF]",
};

const TimeTable = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const data = await getManagerTasks();
        setTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

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

  // Map tasks to days of the week
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const schedule: Record<string, any[]> = {};
  days.forEach((day) => (schedule[day] = []));

  // Process tasks from API and organize by day
  tasks.forEach((task) => {
    if (task.taskDate) {
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
            return "—";
          })(),
          taskDate: task.taskDate,
          taskFor: task.taskFor,
          createdBy: task.createdBy,
        };

        schedule[dayName].push(formattedTask);
      }
    }
  });

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
                      className="flex flex-col justify-between bg-black/30 text-[#0CA9F6] relative overflow-hidden shadow-lg h-[240px] p-4 rounded-[15px] border border-white/10 gap-y-8"
                      style={{
                        opacity: 1,
                        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex flex-col items-start gap-0">
                          <span
                            className={`text-xs font-semibold text-[#0CA9F6] ${taskCodeColor}`}
                          >
                            {task.taskCode}
                          </span>
                          <span className="mt-1 px-2 py-0.5 text-[10px] rounded-full bg-[#0CA9F6] text-white font-semibold">
                            Done
                          </span>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{
                            backgroundColor: priorityColors[
                              (task.priority || "Medium").trim().charAt(0).toUpperCase() + (task.priority || "Medium").trim().slice(1).toLowerCase()
                            ] || "#FFBE31"
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-semibold leading-tight truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-white/80 mt-1 leading-tight truncate">
                          {task.description}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-6">
                        <div className="flex items-center justify-between">
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
                        <div className="flex items-center gap-2 mt-2">
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
