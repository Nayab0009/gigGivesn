import React from "react";

interface TaskUser {
  id: string | number;
  name?: string;
  avatar?: string;
}

interface Task {
  id: string | number;
  title?: string;
  name?: string;
  priority?: string;
  taskFor?: TaskUser;
  createdBy?: TaskUser;
}

interface TodayTasksSectionProps {
  tasks: Task[];
  tasksLoading: boolean;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalCount: number;
  onViewAll: () => void;
}

const TodayTasksSection: React.FC<TodayTasksSectionProps> = ({
  tasks,
  tasksLoading,
  highCount,
  mediumCount,
  lowCount,
  totalCount,
  onViewAll,
}) => {
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  const sortedTodayTasks = [...tasks].sort((a, b) => {
    const pa = priorityOrder[String(a.priority).toLowerCase()] || 99;
    const pb = priorityOrder[String(b.priority).toLowerCase()] || 99;
    if (pa !== pb) return pa - pb;
    return 0;
  });

  return (
    <div
      className="rounded-3xl bg-black/30 backdrop-blur-[101.67px] border border-white/20 shadow-md w-full h-full"
      style={{ minHeight: '248px', padding: '16px', borderRadius: '20px', borderWidth: '1px', opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4
          className="text-[18.3px] font-semibold text-white"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontStyle: 'normal',
            lineHeight: '28.47px',
            letterSpacing: '0px',
            verticalAlign: 'middle',
          }}
        >
          
          Today Task
        </h4>
        <button className="text-sm text-blue-400 hover:text-blue-300" onClick={onViewAll}>
          See All
        </button>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16.27px', width: '100%', height: '159px' }}
      >
        {tasksLoading ? (
          <div className="col-span-3 flex flex-col items-center justify-center text-center py-8">
            <span className="text-blue-200">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-3 text-center text-blue-200 py-8">No tasks found.</div>
        ) : (
          sortedTodayTasks.map((task, idx) => {
            const priorityLabel = task.priority ? `${task.priority} Priority` : "Task";
            const priorityColorClass = "text-blue-400";
            const assignedUsers = [task.taskFor].filter(Boolean);
            if (task.createdBy && !assignedUsers.find(u => u && u.id === task.createdBy?.id)) {
              assignedUsers.push(task.createdBy);
            }
            let completed = 0;
            if (task.priority?.toLowerCase() === "high") {
              completed = highCount;
            } else if (task.priority?.toLowerCase() === "medium") {
              completed = mediumCount;
            } else if (task.priority?.toLowerCase() === "low") {
              completed = lowCount;
            }
            return (
              <div
                key={task.id || idx}
                className="flex flex-col justify-between border border-white/20 w-full"
                style={{
                  borderRadius: '15px',
                  borderWidth: '1px',
                  padding: '16.27px',
                  background: 'rgba(0,0,0,0.18)',
                  minHeight: '158.6px',
                  maxHeight: '158.6px',
                  height: '158.6px',
                  opacity: 1,
                }}
              >
                <div
                  className={`mb-2`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '12.2px',
                    lineHeight: '16.27px',
                    letterSpacing: '0px',
                    verticalAlign: 'middle',
                    color: '#60a5fa', // text-blue-400
                  }}
                >
                  {priorityLabel}
                </div>
                <div
                  className="mb-4"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    fontSize: '18.3px',
                    lineHeight: '28.47px',
                    letterSpacing: '0px',
                    verticalAlign: 'middle',
                    color: '#fff',
                  }}
                >
                  {task.title || task.name || "Untitled Task"}
                </div>
                <div className="flex -space-x-2 mb-4">
                  {assignedUsers.map((user, i) => (
                    <div key={user?.id || i} className="relative">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          className="w-8 h-8 rounded-full border-2 border-black object-cover"
                          alt={user.name || ""}
                          title={user.name || ""}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-blue-600 text-white flex items-center justify-center text-xs" title={user?.name || ""}>
                          {user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-24 h-1 bg-gray-700 rounded-full">
                    <div className="h-1 rounded-full bg-blue-400" style={{ width: totalCount > 0 ? `${(completed / totalCount) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-medium text-blue-400">{completed}/{totalCount}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodayTasksSection;
