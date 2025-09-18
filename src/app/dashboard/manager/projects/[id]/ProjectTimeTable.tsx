// src/components/TimeTable.jsx

import { useEffect, useState } from "react";
import { getTasksByProjectId } from "@/lib/TaskService";
import { MoreHorizontal } from "lucide-react";

// Helper to get day name from date string
function getDayName(dateString: string) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = new Date(dateString);
  return days[date.getDay()];
}

const colors: Record<string, string> = {
  High: "bg-red-500",
  Critical: "bg-orange-500",
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
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const schedule: Record<string, any[]> = {};
    days.forEach(day => (schedule[day] = []));
    tasks.forEach(task => {
      if (task.taskDate) {
        const dayName = getDayName(task.taskDate);
        if (schedule[dayName]) {
          schedule[dayName].push(task);
        }
      }
    });

    // Helper: get time string from taskDate
    function getTimeString(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
          <div className="w-full overflow-x-auto">
            
            <div
              className="grid border border-white/10 rounded-xl min-w-[900px]"
              style={{ gridTemplateColumns: '3.5rem repeat(5, 1fr)' }}
            >
              {/* Time Column */}
              <div className="flex flex-col border-r border-white/10 w-14 min-w-[3.5rem]">
                {[
                  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
                ].map(
                  (time) => (
                    <div
                      key={time}
                      className="h-20 flex items-start justify-end pr-2 text-xs text-gray-400 border-b border-white/5"
                    >
                      {time}
                    </div>
                  )
                )}
              </div>
    
              {/* Days Columns */}
              {days.map((day) => {
                // Sort tasks by due date (taskDate) for this day
                const sortedTasks = [...schedule[day]].sort((a, b) => new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime());
                return (
                  <div key={day} className="flex flex-col border-r border-white/10">
                    <div className="h-10 flex items-center justify-center font-medium text-white bg-black/30">
                      {day}
                    </div>
                    <div className="flex flex-col gap-4 min-h-[880px] p-2"> {/* Use flex column, gap for spacing */}
                      {loading ? (
                        <div className="text-center text-blue-200 py-8">Loading...</div>
                      ) : sortedTasks.length === 0 ? (
                        <div className="text-center text-white/30 py-20">No tasks</div>
                      ) : (
                        sortedTasks.map((task, idx) => {
                          // Determine gradient color based on status or priority
                          const gradientClass = 
                            task.status === 'completed' ? 'from-emerald-900/90 to-emerald-950' :
                            task.status === 'in-progress' ? 'from-blue-900/90 to-blue-950' :
                            task.priority === 'High' ? 'from-amber-900/90 to-amber-950' :
                            'from-[#18323b] to-[#1a2a3a]';
                          return (
                            <div
                              key={task.id || idx}
                              className={`rounded-lg p-3 text-white shadow-md border border-white/10 bg-gradient-to-br ${gradientClass} hover:shadow-lg hover:scale-[1.01] transition-transform z-10`}
                              style={{ minHeight: '70px' }}
                            >
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="px-2 py-0.5 rounded bg-blue-500/30">#{task.ticketNumber || task.id}</span>
                                <span className={`px-2 py-0.5 rounded text-white text-[10px] ${colors[task.priority] ?? "bg-gray-500"}`}>
                                  {task.priority || 'Normal'}
                                </span>
                              </div>
                              <div className="font-semibold text-sm">{task.title}</div>
                              <div className="text-xs text-gray-300 line-clamp-2">
                                {task.description || 'No description provided'}
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                                <div className="flex -space-x-2">
                                  {/* User avatars - using initials instead of images */}
                                  {task.taskFor?.avatar ? (
                                <img
                                  src={task.taskFor.avatar}
                                  className="w-6 h-6 rounded-full border border-black object-cover"
                                  alt={task.taskFor.name || 'Assignee'}
                                  title={task.taskFor.name || 'Assignee'}
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] border border-black" 
                                  title={task.taskFor?.name || 'Assignee'}>
                                  {task.taskFor?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] border border-black"
                                       title={task.createdBy?.name || 'Creator'}>
                                    {task.createdBy?.name?.charAt(0) || 'M'}
                                  </div>
                                </div>
                                <span className="bg-black/30 px-2 py-0.5 rounded">{task.taskDate ? getTimeString(task.taskDate) : ''}</span>
                                <MoreHorizontal size={16} className="text-gray-400" />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      };
    
    export default TimeTable;
