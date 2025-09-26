"use client"
import { FC, useState } from "react"



interface TaskUser {
  id: string | number
  name?: string
  avatar?: string
}

interface Task {
  id: string | number
  title?: string
  name?: string
  priority?: string
  taskFor?: TaskUser
  createdBy?: TaskUser
}

interface TodayTasksSectionProps {
  tasks: Task[]
  isLoading: boolean
}

const TodayTasksSection: FC<TodayTasksSectionProps> = ({ tasks, isLoading }) => {
  // Count tasks by priority
  const highCount = tasks.filter(t => t.priority?.toLowerCase() === "high").length;
  const mediumCount = tasks.filter(t => t.priority?.toLowerCase() === "medium").length;
  const lowCount = tasks.filter(t => t.priority?.toLowerCase() === "low").length;
  const totalCount = tasks.length || 1; // Avoid division by zero

 return (
    <div
      className="rounded-3xl bg-black/30 backdrop-blur-md border border-white/30 shadow-md w-full"
      style={{ height: '248px', minHeight: '248px', maxHeight: '248px', padding: '16.27px', borderRadius: '24px', borderWidth: '1px', opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg md:text-xl font-bold tracking-tight">Today Task</h4>
        <a href="#" className="text-xs font-medium text-blue-300 hover:underline">See All</a>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16.27px', width: '100%', height: '159px' }}
      >
        {tasks && tasks.length > 0 ? (
          tasks.map((task, idx) => {
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
                className="flex flex-col justify-between rounded-3xl border border-white/20 w-full"
                style={{
                  borderRadius: '24px',
                  borderWidth: '1px',
                  padding: '16.27px',
                  background: 'rgba(0,0,0,0.18)',
                  minHeight: '158.6px',
                  maxHeight: '158.6px',
                  height: '158.6px',
                  // width: '305.16px',
                  opacity: 1,
                }}
              >
                <div className="text-xs font-medium mb-2 text-blue-400">{task.priority ? `${task.priority} Priority` : "Task"}</div>
                <div className="font-bold text-lg text-white mb-4">{task.title || task.name || "Untitled Task"}</div>
                <div className="flex -space-x-2 mb-4">
                  {assignedUsers.map((user, i) => (
                    <div key={user?.id || i} className="relative">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          className="w-8 h-8 rounded-full border-2 border-black object-cover"
                          alt={user.name || ''}
                          title={user.name || ''}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-black bg-blue-600 text-white flex items-center justify-center text-xs" title={user?.name || ''}>
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-20 h-1 bg-gray-600 rounded-full">
                    <div className="h-1 rounded-full bg-blue-400" style={{ width: totalCount > 0 ? `${(completed/totalCount)*100}%` : '0%' }}></div>
                  </div>
                  <span className="text-xs font-medium text-blue-400">{completed}/{totalCount}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center text-blue-200 py-8">No tasks found.</div>
        )}
      </div>
    </div>
  )
}

export default TodayTasksSection