// src/components/TimeTable.tsx

import { useEffect, useState } from "react";
import { getManagerTasks ,getTaskById} from "@/lib/TaskService";
import { MoreHorizontal } from "lucide-react";
import TaskDetailsPopup from "./TaskDetails";

// Helper to get day name from date string
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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const schedule: Record<string, any[]> = {};
    days.forEach(day => (schedule[day] = []));

    // Process tasks from API and organize by day
    tasks.forEach(task => {
      if (task.taskDate) {
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
            duration: (() => {
              if (task.taskOf?.startDate && task.taskOf?.endDate) {
                const start = new Date(task.taskOf.startDate);
                const end = new Date(task.taskOf.endDate);
                const diffMs = end.getTime() - start.getTime();
                if (diffMs > 0) {
                  const h = Math.floor(diffMs / 3600000);
                  const m = Math.floor((diffMs % 3600000) / 60000);
                  return `${h > 0 ? h + 'h ' : ''}${m}m`;
                }
              }
              return '—';
            })(),
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
    });

    // Get the current date to generate day numbers
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayDate = new Date(today);

    // Adjust to get Monday's date
    const daysFromMonday = currentDay === 0 ? 7 : currentDay - 1;
    mondayDate.setDate(today.getDate() - daysFromMonday);

    // Generate day numbers for the week starting from Monday
    const dayNumbers: Record<string, string> = {};
    days.forEach((day, index) => {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + index);
      dayNumbers[day] = date.getDate().toString();
    });

    return (
      <div className="w-full overflow-x-auto bg-black/30 p-4 rounded-3xl"
      style={
        {
          scrollbarWidth: 'none',
      }
    }
      >
        <div className="flex flex-row gap-2 min-w-[900px]">
          {/* Days headers and task columns */}
          {days.map((day) => {
            const tasks = schedule[day];
            return (
              <div key={day} className="flex flex-col gap-2 min-w-[120px]">
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
                    task.taskCode?.startsWith("FAZ") ? "text-[#0CA9F6]" :
                    task.taskCode?.startsWith("SO") ? "text-[#0CA9F6]" : "text-[#0CA9F6]";
                  return (
                    <div
                      key={`${day}-${task.id || idx}`}
                      className="flex flex-col justify-between bg-black/30 text-[#0CA9F6]relative overflow-hidden shadow-lg w-full min-h-[180px] p-4 rounded-[15px] border border-white/10 gap-y-8"
                      style={{ opacity: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex flex-col items-start gap-0">
                          <span className={`text-xs font-semibold text-[#0CA9F6] ${taskCodeColor}`}>{task.taskCode}</span>
                          <span className="mt-1 px-2 py-0.5 text-[10px] rounded-full bg-[#0CA9F6] text-white font-semibold">Done</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFBE31] text-white font-semibold">Critical</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-base font-semibold leading-tight">{task.title}</div>
                        <div className="text-xs text-white/80 mt-1">Review Project Goals and Objective</div>
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

                          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-black/30 border border-white/10 cursor-pointer"
                            onClick={e => { e.stopPropagation(); handleTaskClick(task.id); }}>
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
        {isPopupOpen && selectedTask && (
            <TaskDetailsPopup task={selectedTask} onClose={closePopup} />
        )}
      </div>
    );

  };
// commit
export default TimeTable;
