// src/components/TimeTable.jsx

import { useEffect, useState } from "react";
import { getAllTasks } from "@/lib/TaskService";
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

const TimeTable = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const data = await getAllTasks();
          setTasks(Array.isArray(data) ? data : []);
        } catch {
          setTasks([]);
        } finally {
          setLoading(false);
        }
      };
      fetchTasks();
    }, []);

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
                  className="h-20 flex items-start justify-end pr-2 text-xs text-gray-400"
                >
                  {time}
                </div>
              )
            )}
          </div>

          {/* Days Columns */}
          {days.map((day) => (
            <div key={day} className="flex flex-col border-r border-white/10">
              <div className="h-10 flex items-center justify-center font-medium text-white bg-black/30">
                {day}
              </div>
              <div className="relative flex-1">
                {loading ? (
                  <div className="absolute left-0 right-0 text-center text-blue-200 py-8">Loading...</div>
                ) : schedule[day].length === 0 ? null : (
                  schedule[day].map((task, idx) => {
                    // Place each task at 10:00 for demo, or use task.taskDate time
                    const topPx = task.taskDate ? (new Date(task.taskDate).getHours() - 8) * 80 : idx * 80;
                    return (
                      <div
                        key={task.id || idx}
                        className="absolute left-2 right-2 rounded-lg p-3 text-white shadow-md border border-white/10 bg-gradient-to-br from-[#18323b] to-[#1a2a3a]"
                        style={{ top: `${topPx}px` }}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="px-2 py-0.5 rounded bg-blue-500/30">{task.ticketNumber || task.id}</span>
                          <span className={`px-2 py-0.5 rounded text-white text-[10px] ${colors[task.priority] ?? "bg-gray-500"}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="font-semibold text-sm">{task.title}</div>
                        <div className="text-xs text-gray-300">{task.description}</div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                          <div className="flex -space-x-2">
                            {/* No members in API, so show default avatars */}
                            <img src="/avatars/u1.png" className="w-6 h-6 rounded-full border border-black" />
                            <img src="/avatars/u2.png" className="w-6 h-6 rounded-full border border-black" />
                          </div>
                          <span>{task.taskDate ? getTimeString(task.taskDate) : ''}</span>
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default TimeTable;
