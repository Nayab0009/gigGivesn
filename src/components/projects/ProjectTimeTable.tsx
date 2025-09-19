// src/components/TimeTable.jsx

import { useEffect, useState } from "react";
import { getTasksByProjectId } from "@/lib/TaskService";
import { MoreHorizontal } from "lucide-react";

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

interface TimeTableProps {
  projectId?: string | number;
}

const TimeTable = ({ projectId }: TimeTableProps) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
          setLoading(true);
          try {
            let data;
            if (projectId) {
              data = await getTasksByProjectId(String(projectId));
            }
            setTasks(Array.isArray(data) ? data : []);
          } catch {
            setTasks([]);
          } finally {
            setLoading(false);
          }
        };
        fetchTasks();
      }, [projectId]);
    

    // Map tasks to days
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
      <div className="w-full overflow-x-auto bg-gradient-to-br from-teal-900/20 to-blue-900/30 p-4 rounded-xl"
          style={
        {
          scrollbarWidth: 'none',    
      } 
    }>
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
                    task.taskCode?.startsWith("FAZ") ? "text-orange-500" :
                    task.taskCode?.startsWith("SO") ? "text-blue-500" : "text-gray-300";
                  return (
                    <div key={`${day}-${task.id || idx}`} className="rounded-xl p-4 bg-black/20 border border-white/10 text-white relative overflow-hidden">
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-xs ${taskCodeColor}`}>{task.taskCode}</span>
                          </div>
                          <span className={`text-xs ${priorityColorMap[task.priority] || "bg-gray-500"} px-2 py-0.5 rounded-sm`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-xs text-gray-300 mt-1">{task.description}</div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex -space-x-2">
                            {/* Task assignee avatar */}
                            {task.taskFor?.avatar ? (
                              <img
                                src={task.taskFor.avatar}
                                className="w-6 h-6 rounded-full border border-black object-cover"
                                alt={task.taskFor.name || 'Assignee'}
                                title={task.taskFor.name || 'Assignee'}
                              />
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] border border-black"
                                title={task.taskFor?.name || 'Assignee'}
                              >
                                {task.taskFor?.name?.charAt(0) || 'A'}
                              </div>
                            )}
                            {/* Task creator avatar */}
                            {task.createdBy?.avatar ? (
                              <img
                                src={task.createdBy.avatar}
                                className="w-6 h-6 rounded-full border border-black object-cover"
                                alt={task.createdBy.name || 'Creator'}
                                title={task.createdBy.name || 'Creator'}
                              />
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] border border-black"
                                title={task.createdBy?.name || 'Creator'}
                              >
                                {task.createdBy?.name?.charAt(0) || 'C'}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">0h 52m</span>
                            <span className="w-6 h-6 flex items-center justify-center">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor" fillOpacity="0.5" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </>
                    </div>
                  );
                })}
                {tasks.length === 0 && (
                  <div className="h-32 rounded-xl border border-white/5 flex items-center justify-center text-white/30 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );

  };

export default TimeTable;
