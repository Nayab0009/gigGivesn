"use client"
import { FC } from "react"

interface MyTaskCardProps {
  totalProjects: number
  inProgress: number
  completed: number
  pending: number
}

const MyTaskCard: FC<MyTaskCardProps> = ({
  totalProjects,
  inProgress,
  completed,
  pending
}) => {
  // Calculate percentages for the chart
  const inProgressPercentage = Math.round((inProgress / totalProjects) * 100) || 0
  const completedPercentage = Math.round((completed / totalProjects) * 100) || 0
  const pendingPercentage = Math.round((pending / totalProjects) * 100) || 0
  
  return (
    <div className="rounded-3xl p-5 flex flex-col border border-white/30 bg-black/30 shadow-md w-full min-w-[280px] max-w-[340px] mx-auto h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-white">My Task</h3>
        <div className="text-xs font-medium text-blue-300">
          Total project {totalProjects}
        </div>
      </div>

      <div className="flex items-center mt-2 justify-between">

        {/* Legend */}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span className="text-xs text-white">In Progress <span className="font-bold">50%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-xs text-white">Completed <span className="font-bold">25%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-xs text-white">Pending <span className="font-bold">15%</span></span>
          </div>
        </div>
        {/* Donut chart */}
        <div className="relative flex-shrink-0 w-[120px] h-[120px]">
          
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 space-y-0.5">
            
            {/* Background circle */}
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#374151" strokeWidth="3.5" />
            
            {/* In Progress - Purple */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3.5"
              strokeDasharray="50 50"
              strokeLinecap="round"
              strokeDashoffset="25"
            />
            
            {/* Completed - Orange */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#f97316"
              strokeWidth="3.5"
              strokeDasharray="25 75"
              strokeLinecap="round"
              strokeDashoffset="75"
            />
            
            {/* Pending - Blue */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeDasharray="15 85"
              strokeLinecap="round"
              strokeDashoffset="100"
            />
          </svg>
        </div>
        
       
        
      </div>
    </div>
  )
}

export default MyTaskCard